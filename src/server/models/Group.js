'use strict';
import config from 'config';
import slugify from 'limax';
import { get, omit } from 'lodash';
import debugLib from 'debug';
const debug = debugLib('group');
import { isISO31661Alpha2 } from 'validator';

module.exports = (sequelize, DataTypes) => {
  const { models, Op } = sequelize;

  const Group = sequelize.define(
    'Group',
    {
      GroupId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Groups',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: true,
        get() {
          return this.getDataValue('GroupId') || this.id;
        },
      },
      ParentGroupId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Groups',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: true,
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.STRING, // PUBLISHED | ARCHIVED | DRAFT | DELETED,
        defaultValue: 'PUBLISHED',
      },
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        set(slug) {
          if (slug && slug.toLowerCase) {
            this.setDataValue(
              'slug',
              slug
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/\./g, ''),
            );
          }
        },
      },
      type: {
        type: DataTypes.STRING, // GROUP, EVENT
        defaultValue: 'GROUP',
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      website: DataTypes.STRING,
      image: DataTypes.STRING,
      color: DataTypes.STRING,
      geoLocationLatLong: DataTypes.GEOMETRY('POINT'),
      locationName: DataTypes.STRING,
      address: DataTypes.STRING,
      zipcode: DataTypes.STRING,
      city: DataTypes.STRING,
      countryCode: {
        type: DataTypes.STRING,
        length: 2,
        validate: {
          len: 2,
          isValidCountryCode(value) {
            if (!isISO31661Alpha2(value)) {
              throw new Error('Invalid Country Code.');
            }
          },
        },
      },
      startsAt: DataTypes.DATE,
      endsAt: DataTypes.DATE,
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      settings: DataTypes.JSON,
      formData: DataTypes.JSONB,
      location: {
        type: DataTypes.VIRTUAL,
        get() {
          return {
            name: this.locationName,
            address: this.address,
            zipcode: this.zipcode,
            city: this.city,
            countryCode: this.countryCode,
            lat:
              this.geoLocationLatLong && this.geoLocationLatLong.coordinates && this.geoLocationLatLong.coordinates[0],
            long:
              this.geoLocationLatLong && this.geoLocationLatLong.coordinates && this.geoLocationLatLong.coordinates[1],
          };
        },
      },
    },
    {
      paranoid: true,
      indexes: [
        {
          fields: ['slug', 'status'],
        },
        {
          fields: ['GroupId', 'status'],
        },
      ],
      hooks: {
        beforeValidate: group => {
          if (!group.slug && !group.name) {
            throw new Error('Group validation error: need to provide a slug or a name', group);
          }
          group.slug = group.slug || slugify(group.name);
          const location = get(group, 'dataValues.location');
          if (location) {
            group.locationName = location.name;
            group.address = location.address;
            group.city = location.city;
            group.countryCode = location.countryCode;
            group.zipcode = location.zipcode;
            if (location.lat) {
              group.geoLocationLatLong = {
                type: 'Point',
                coordinates: [location.lat, location.long],
              };
            }
          }
          return group;
        },
        afterCreate: async group => {
          let action = 'CREATE';
          if (group.getDataValue('GroupId')) {
            action = 'EDIT';
          } else {
            group.GroupId = group.id;
            await group.update({ GroupId: group.id });
          }
          models.Activity.create({
            action,
            UserId: group.UserId,
            GroupId: group.GroupId,
            TargetUUID: group.uuid,
          });
        },
      },
    },
  );

  // Get the latest version of the group by slug (and optional status PUBLISHED/ARCHIVED/PENDING)
  Group.findBySlug = (slug, status) => {
    const where = { slug: slug.toLowerCase() };
    if (status) {
      where.status = status;
    }
    return Group.findOne({ where, order: [['id', 'DESC']] });
  };

  Group.findByGroupId = (GroupId, status) => {
    const where = { GroupId };
    if (status) {
      where.status = status;
    }
    return Group.findOne({ where, order: [['id', 'DESC']] });
  };

  Group.prototype.getUrl = async function() {
    return `${get(config, 'server.baseUrl')}/${this.slug}`;
  };

  /**
   * Edits a group and saves a new version
   */
  Group.prototype.edit = async function(groupData) {
    const newVersionData = {
      ...omit(this.dataValues, ['id']),
      ...groupData,
      version: this.version + 1,
      status: groupData.status || 'PUBLISHED',
    };
    if (newVersionData.status === 'PUBLISHED') {
      await this.update({ status: 'ARCHIVED' });
    }
    return await Group.create(newVersionData);
  };

  Group.prototype.addAdmin = async function(UserId) {
    return await models.Member.create({
      UserId,
      GroupId: this.GroupId,
      role: 'ADMIN',
    });
  };

  /**
   * publish a given version of a group
   */
  Group.prototype.publish = async function() {
    const currentlyPublishedGroup = await Group.findOne({ where: { GroupId: this.GroupId, status: 'PUBLISHED' } });
    if (currentlyPublishedGroup) {
      await currentlyPublishedGroup.update({ status: 'ARCHIVED' });
    }
    return await this.update({ status: 'PUBLISHED' });
  };

  Group.prototype.getPath = async function() {
    return `/${this.slug}`;
  };

  Group.prototype.getPosts = async function(options = {}) {
    const query = {
      where: {
        GroupId: this.GroupId,
        ParentPostId: { [Op.is]: null },
        status: 'PUBLISHED',
      },
      order: [['id', 'DESC']],
    };
    if (options.limit) query.limit = options.limit;
    if (options.offset) query.offset = options.offset;
    debug('getPosts', this.slug, query);
    const { count, rows } = await models.Post.findAndCountAll(query);
    return {
      total: count,
      nodes: rows,
      type: 'Post',
      limit: options.limit,
      offset: options.offset,
    };
  };

  /**
   * Add members
   * @PRE: recipients: array({ name, email });
   */
  Group.prototype.addMembers = async function(recipients, options = {}) {
    const promises = recipients.map(recipient => models.User.findOrCreate(recipient));
    const users = await Promise.all(promises);
    return Promise.all(users.map(user => user && user.join({ GroupId: this.GroupId, ...options })));
  };

  /**
   * Add followers
   * @PRE: recipients: array({ name, email });
   */
  Group.prototype.addFollowers = async function(recipients) {
    return this.addMembers(recipients, { role: 'FOLLOWER' });
  };

  Group.prototype.getMembers = async function(role) {
    const memberships = await models.Member.findAll({
      where: { GroupId: this.GroupId, role },
      include: [{ model: models.User, as: 'user' }],
    });
    return memberships.map(m => m.user);
  };

  Group.prototype.getFollowers = async function() {
    return this.getMembers('FOLLOWER');
  };

  Group.prototype.getAdmins = async function() {
    return this.getMembers('ADMIN');
  };

  return Group;
};
