'use strict';
import config from 'config';
import slugify from 'limax';
import { omit, get, uniq } from 'lodash';
import libemail from '../lib/email';
import { extractNamesAndEmailsFromString, isEmpty } from '../lib/utils';
import debugLib from 'debug';
import { inspectRows } from '../lib/jest';
const debug = debugLib('post');
import markdown from '../lib/markdown';
import { isISO31661Alpha2 } from 'validator';

module.exports = (sequelize, DataTypes) => {
  const { models } = sequelize;

  const Post = sequelize.define(
    'Post',
    {
      // Canonical post id since a post can have multiple versions
      PostId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Posts',
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
      GroupId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Groups',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: false,
      },
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
      ParentPostId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Posts',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: true,
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
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
      EmailMessageId: DataTypes.STRING,
      type: {
        type: DataTypes.STRING, // POST, EVENT
        defaultValue: 'POST',
      },
      title: DataTypes.STRING,
      html: {
        type: DataTypes.TEXT,
        get() {
          if (this.getDataValue('html')) return this.getDataValue('html');
          if (this.getDataValue('text')) return markdown(this.getDataValue('text'));
          return '';
        },
      },
      text: DataTypes.TEXT,
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      email: DataTypes.JSON,
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
      website: DataTypes.STRING,
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
          fields: ['PostId', 'status'],
        },
      ],
      hooks: {
        beforeValidate: post => {
          if (!post.slug && !post.title) {
            throw new Error('Post validation error: need to provide a slug or a title', post);
          }
          const tags = post.dataValues.title && post.dataValues.title.match(/#[a-z0-9_]+/g);
          if (tags) {
            post.tags = post.tags || [];
            tags.map(t => {
              post.tags.push(t.toLowerCase().substr(1));
            });
            post.tags = uniq(post.tags);
            post.title = post.dataValues.title.replace(/ ?#[a-z0-9_]+/g, '');
          }
          post.slug = post.slug || slugify(post.title);
          const location = get(post, 'dataValues.location');
          if (location) {
            post.locationName = location.name;
            post.address = location.address;
            post.city = location.city;
            post.countryCode = location.countryCode;
            post.zipcode = location.zipcode;
            if (location.lat) {
              post.geoLocationLatLong = {
                type: 'Point',
                coordinates: [location.lat, location.long],
              };
            }
          }

          return post;
        },
        afterCreate: async post => {
          let action = 'CREATE';
          if (post.PostId) {
            action = 'EDIT';
          } else {
            post.PostId = post.id;
            await post.update({ PostId: post.id, slug: `${post.slug}-${post.PostId}` });
          }
          const activityData = {
            action,
            UserId: post.UserId,
            GroupId: post.GroupId,
            PostId: post.PostId,
            TargetUUID: post.uuid,
          };
          models.Activity.create(activityData);
        },
      },
    },
  );

  // Get the latest version of the post by slug (and optional status PUBLISHED/ARCHIVED/PENDING)
  Post.findBySlug = (slug, status) => {
    const where = { slug: slug.toLowerCase() };
    if (status) {
      where.status = status;
    }
    return Post.findOne({ where, order: [['id', 'DESC']] });
  };

  // Get the latest version of the post by PostId (and optional status PUBLISHED/ARCHIVED/PENDING)
  Post.findByPostId = (PostId, status) => {
    if (!PostId) {
      throw new Error('Post.findByPostId: missing PostId');
    }
    const where = { PostId };
    if (status) {
      where.status = status;
    }
    return Post.findOne({ where, order: [['id', 'DESC']] });
  };

  Post.findByEmailMessageId = EmailMessageId => {
    return Post.findOne({ where: { EmailMessageId }, order: [['version', 'DESC']] });
  };

  /**
   * Create a post from an email object returned by mailgun
   * If the group doesn't exist, we create it and add the sender as the admin
   * @POST:
   *   - create new user / new group if needed
   *   - new Post created and sent to all followers of the group and all recipients
   *   - sender and all recipients (To, Cc) added as followers of the Post
   */
  Post.createFromEmail = async email => {
    const parsedHeaders = libemail.parseHeaders(email);
    const { recipients, ParentPostId } = parsedHeaders;
    const groupSlug = get(parsedHeaders, 'group.slug');
    const groupEmail = get(parsedHeaders, 'group.email');

    // if the content of the email is empty, we don't create any post
    if (isEmpty(email['stripped-text'])) {
      return;
    }

    const userData = extractNamesAndEmailsFromString(email.From)[0];
    const user = await models.User.findByEmail(userData.email);
    const group = await models.Group.findBySlug(groupSlug, 'PUBLISHED');

    let parentPost;
    if (ParentPostId) {
      parentPost = await Post.findByPostId(ParentPostId, 'PUBLISHED');
    } else {
      if (email['In-Reply-To']) {
        // if it's a reply to a thread
        const inReplyToPost = await models.Post.findByEmailMessageId(email['In-Reply-To']);
        parentPost =
          inReplyToPost && inReplyToPost.ParentPostId
            ? await models.Post.findByPk(inReplyToPost.ParentPostId)
            : inReplyToPost;
      }
    }
    const postData = {
      GroupId: group.GroupId,
      title: email.subject,
      html: libemail.getHTML(email),
      text: email['stripped-text'],
      EmailMessageId: email['Message-Id'],
      email,
      ParentPostId: parentPost && parentPost.PostId,
    };
    const post = await user.createPost(postData);
    const thread = parentPost ? parentPost : post;
    // We always add people explicitly mentioned in To or Cc as followers of the thread
    await thread.addFollowers(recipients);

    // If it's a new thread,
    if (!parentPost) {
      // if the group is of type announcements, only the admins can create new threads
      if (get(group, 'settings.type') === 'announcements') {
        const isAdmin = await user.isAdmin(group);
        if (!isAdmin) {
          const templateData = {
            subject: 'Cannot send email to group (must be an admin)',
            body: 'Only the administrators can post a new message to this group.',
            email: { html: postData.html, text: postData.text },
          };
          await libemail.sendTemplate('error', templateData, user.email);
          return;
        }
      }
    }

    post.group = group;
    post.user = user;
    post.parentPost = parentPost;

    const excludeEmails = recipients.map(r => r.email);
    await post.notifyFollowers(excludeEmails);

    return post;
  };

  Post.prototype.populate = async function(attrs) {
    const promises = [];
    attrs.map(attr => {
      switch (attr) {
        case 'parentPost':
          this.ParentPostId &&
            !this.parentPost &&
            promises.push(() =>
              models.Post.findByPostId(ParentPostId, 'PUBLISHED').then(post => (this.parentPost = post)),
            );
          break;
        case 'group':
          this.GroupId &&
            !this.group &&
            promises.push(() => models.Group.findByGroupId(GroupId, 'PUBLISHED').then(group => (this.group = group)));
          break;
        case 'user':
          this.UserId &&
            !this.user &&
            promises.push(() => models.Group.findById(UserId).then(user => (this.user = user)));
          break;
      }
    });
    await Promise.all(promises);
    return this;
  };

  Post.prototype.notifyFollowers = async function(excludeEmails = []) {
    // We don't notify followers when editing an existing post
    if (this.version !== 1) return Promise.resolve();
    await this.populate(['parentPost', 'group', 'user']);
    const thread = this.parentPost ? this.parentPost : this;
    const groupSlug = this.group.slug;
    const groupEmail = `${groupSlug}@${config.server.domain}`;

    const headers = {
      'Message-Id': `${groupSlug}/${thread.PostId}/${this.PostId}@${get(config, 'server.domain')}`,
      References: `${groupSlug}/${thread.PostId}@${get(config, 'server.domain')}`,
      'Reply-To': `${groupEmail} <${groupSlug}/${thread.PostId}/${this.PostId}@${get(config, 'server.domain')}>`,
    };

    let templateData;
    // If it's a new thread,
    if (!this.parentPost) {
      const followers = await this.group.getFollowers();
      const url = await this.getUrl();
      templateData = { groupSlug, followersCount: followers.length, post: this.dataValues, url };
      await libemail.sendTemplate('threadCreated', templateData, this.user.email);
      // We send the new post to followers of the group + the recipients
      const unsubscribeLabel = `unfollow this group`;
      const subscribeLabel = `follow this thread`;
      templateData = {
        groupSlug,
        url,
        post: this.dataValues,
        subscribe: { label: subscribeLabel, data: { UserId: this.user.id, PostId: this.PostId } },
        unsubscribe: { label: unsubscribeLabel, data: { UserId: this.user.id, GroupId: this.group.id } },
      };
      const cc = followers.filter(f => !excludeEmails.includes(f.email)).map(u => u.email);
      await libemail.sendTemplate('post', templateData, groupEmail, {
        exclude: [this.user.email],
        from: `${this.user.name} <${groupEmail}>`,
        cc,
        headers,
      });
    } else {
      let followers;
      if (get(this.parentPost, 'settings.type') === 'announcements') {
        // if the post is of type announcements, only the admins can receive replies
        followers = await thread.getAdmins();
      } else {
        // if it's part of a thread, we send the post to the followers of the parent post + recipients
        followers = await thread.getFollowers();
      }
      const unsubscribeLabel = `unfollow this thread`;
      templateData = {
        groupSlug,
        url: `${get(config, 'server.baseUrl')}/${groupSlug}/${this.type.toLowerCase()}s/${thread.slug}`,
        post: this.dataValues,
        unsubscribe: { label: unsubscribeLabel, data: { PostId: thread.PostId } },
      };
      await libemail.sendTemplate('post', templateData, groupEmail, {
        exclude: [this.user.email],
        from: `${this.user.name} <${groupEmail}>`,
        cc: followers.map(u => u.email),
        headers,
      });
    }
  };

  /**
   * Edits a post and saves a new version
   */
  Post.prototype.edit = async function(postData) {
    const newVersionData = {
      ...omit(this.dataValues, ['id']),
      ...postData,
      status: postData.status || 'PUBLISHED',
      version: this.version + 1,
    };
    if (newVersionData.status === 'PUBLISHED') {
      await this.update({ status: 'ARCHIVED' });
    }
    return await Post.create(newVersionData);
  };

  /**
   * Add followers
   * @PRE: recipients: array({ name, email });
   */
  Post.prototype.addFollowers = async function(recipients) {
    const promises = recipients.map(async recipient => {
      try {
        return await models.User.findOrCreate(recipient);
      } catch (e) {
        console.error(e);
      }
    });
    const users = await Promise.all(promises);
    return Promise.all(users.map(user => user && user.follow({ PostId: this.PostId })));
  };

  Post.prototype.addAdmin = async function(UserId) {
    return await models.Member.create({
      UserId,
      PostId: this.PostId,
      role: 'ADMIN',
    });
  };

  /**
   * publish a given version of a Post
   */
  Post.prototype.publish = async function() {
    const currentlyPublishedPost = await Post.findOne({ where: { PostId: this.PostId, status: 'PUBLISHED' } });
    if (currentlyPublishedPost) {
      await currentlyPublishedPost.update({ status: 'ARCHIVED' });
    }
    await this.update({ status: 'PUBLISHED' });
    this.notifyFollowers();
    return this;
  };

  Post.prototype.getPath = async function() {
    const group = await models.Group.findOne({ where: { GroupId: this.GroupId } });
    if (this.ParentPostId) {
      const thread = await models.Post.findOne({ where: { PostId: this.ParentPostId } });
      return `/${group.slug}/posts/${thread.slug}#${this.PostId}`;
    } else {
      return `/${group.slug}/posts/${this.slug}`;
    }
  };

  /**
   * Returns the full canonical url of this post
   * if groupSlug is passed, it saves a query
   */
  Post.prototype.getUrl = async function(groupSlug) {
    if (!this.path) {
      let group;
      if (groupSlug) {
        group = { slug: groupSlug };
      } else {
        group = await models.Group.findByPk(this.GroupId);
      }
      if (this.ParentPostId) {
        const parentPost = await Post.findByPk(this.ParentPostId);
        this.path = `/${group.slug}/${parentPost.slug}`;
      } else {
        this.path = `/${group.slug}/posts/${this.slug}`;
      }
    }
    return `${get(config, 'server.baseUrl')}${this.path}`;
  };

  Post.prototype.getMembers = async function(role) {
    const where = { PostId: this.PostId, role };
    const memberships = await models.Member.findAll({
      where,
      include: [{ model: models.User, as: 'user' }],
    });
    return memberships.map(m => m.user);
  };

  Post.prototype.getFollowers = async function() {
    return this.getMembers('FOLLOWER');
  };

  Post.prototype.getAdmins = async function() {
    return this.getMembers('ADMIN');
  };

  return Post;
};
