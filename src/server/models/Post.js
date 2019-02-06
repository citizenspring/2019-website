'use strict';
import config from 'config';
import slugify from 'limax';
import { omit, get } from 'lodash';
import libemail from '../lib/email';
import { extractNamesAndEmailsFromString, isEmpty } from '../lib/utils';
import debugLib from 'debug';
import { inspectRows } from '../lib/jest';
const debug = debugLib('post');

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
      html: DataTypes.TEXT,
      text: DataTypes.TEXT,
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      email: DataTypes.JSON,
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
          post.slug = post.slug || slugify(post.title);
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
    const { groupSlug, recipients, ParentPostId } = libemail.parseHeaders(email);
    const groupEmail = `${groupSlug}@${get(config, 'server.domain')}`;

    // if the content of the email is empty, we don't create any post
    if (isEmpty(email['stripped-text'])) {
      return;
    }

    const userData = extractNamesAndEmailsFromString(email.From)[0];
    const user = await models.User.findByEmail(userData.email);
    const group = await models.Group.findBySlug(groupSlug, 'PUBLISHED');

    let parentPost;
    if (ParentPostId) {
      parentPost = await models.Post.findOne({ where: { PostId: ParentPostId, status: 'PUBLISHED' } });
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
    const headers = {
      'Message-Id': `${groupSlug}/${thread.PostId}/${post.PostId}@${get(config, 'server.domain')}`,
      References: `${groupSlug}/${thread.PostId}@${get(config, 'server.domain')}`,
      'Reply-To': `${groupEmail} <${groupSlug}/${thread.PostId}/${post.PostId}@${get(config, 'server.domain')}>`,
    };

    let data;
    // If it's a new thread,
    if (!parentPost) {
      // if the group is of type announcements, only the admins can create new threads
      if (get(group, 'settings.type') === 'announcements') {
        const members = await models.Member.findAll({ where: { GroupId: group.id, role: 'ADMIN' } });
        const isAdmin = await user.isAdmin(group);
        if (!isAdmin) {
          data = {
            subject: 'Cannot send email to group (must be an admin)',
            body: 'Only the administrators can post a new message to this group.',
            email: { html: postData.html, text: postData.text },
          };
          await libemail.sendTemplate('error', data, user.email);
          return;
        }
      }
      const followers = await group.getFollowers();
      const url = await post.getUrl();
      data = { groupSlug, followersCount: followers.length, post, url };
      await libemail.sendTemplate('threadCreated', data, user.email);
      // We send the new post to followers of the group + the recipients
      const unsubscribeLabel = `unfollow this group`;
      const subscribeLabel = `follow this thread`;
      data = {
        groupSlug,
        url,
        post: post.dataValues,
        subscribe: { label: subscribeLabel, data: { UserId: user.id, PostId: post.PostId } },
        unsubscribe: { label: unsubscribeLabel, data: { UserId: user.id, GroupId: group.id } },
      };
      const recipientsEmails = recipients.map(r => r.email);
      const cc = followers.filter(f => !recipientsEmails.includes(f.email)).map(u => u.email);
      await libemail.sendTemplate('post', data, groupEmail, {
        exclude: [user.email],
        from: `${userData.name} <${groupEmail}>`,
        cc,
        headers,
      });
    } else {
      // if it's part of a thread, we send the post to the followers of the parent post + recipients
      const followers = await thread.getFollowers();
      const unsubscribeLabel = `unfollow this thread`;
      data = {
        groupSlug,
        url: `${get(config, 'server.baseUrl')}/${groupSlug}/${thread.slug}`,
        post: post.dataValues,
        unsubscribe: { label: unsubscribeLabel, data: { PostId: thread.PostId } },
      };
      await libemail.sendTemplate('post', data, groupEmail, {
        exclude: [user.email],
        from: `${userData.name} <${groupEmail}>`,
        cc: followers.map(u => u.email),
        headers,
      });
    }
    return post;
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
    return await this.update({ status: 'PUBLISHED' });
  };

  Post.prototype.getPath = async function() {
    const group = await models.Group.findOne({ where: { GroupId: this.GroupId } });
    if (this.ParentPostId) {
      const thread = await models.Post.findOne({ where: { PostId: this.ParentPostId } });
      return `/${group.slug}/${thread.slug}#${this.PostId}`;
    } else {
      return `/${group.slug}/${this.slug}`;
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
        this.path = `/${group.slug}/${this.slug}`;
      }
    }
    return `${get(config, 'server.baseUrl')}${this.path}`;
  };

  Post.associate = m => {
    // post.getFollowers();
    Post.belongsToMany(m.User, {
      through: { model: m.Member, unique: false, scope: { role: 'FOLLOWER' } },
      as: 'followers',
      foreignKey: 'PostId',
    });
  };
  return Post;
};
