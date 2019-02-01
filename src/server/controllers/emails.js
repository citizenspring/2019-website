import config from 'config';
import templates, { render } from '../../server/templates';
import models from '../models';
import { parseEmailAddress, capitalize } from '../lib/utils';
import libemail from '../lib/email';
import { createJwt } from '../lib/auth';
import debugLib from 'debug';
const debug = debugLib('email');

const defaultData = {
  post: {
    groupSlug: 'communication',
    url: 'https://www.citizenspring.be/communication/hello-world-1',
    post: {
      ParentPostId: 1,
      html: '<p>Hello world</p>',
    },
    unsubscribe: {
      label: 'unsubscribe from this thread',
    },
  },
  postEdited: {
    currentVersion: {
      title: 'title v1',
      text: 'Text v1',
      html: '<p>Text <b>v1</b></p>',
      status: 'ARCHIVED',
    },
    newVersion: {
      title: 'title v2',
      text: 'Text v2',
      html: '<p>Text <b>v2</b></p>',
      status: 'PUBLISHED',
    },
    user: { name: 'Xavier' },
  },
  approvePostEdit: {
    currentVersion: {
      title: 'title v1',
      text: 'Text v1',
      html: '<p>Text <b>v1</b></p>',
      status: 'PUBLISHED',
    },
    newVersion: {
      title: 'title v2',
      text: 'Text v2',
      html: '<p>Text <b>v2</b></p>',
      status: 'PENDING',
    },
    user: { name: 'Pia' },
  },
  approveGroupEdit: {
    url: 'https://www.citizenspring.be/communication',
    user: { name: 'Pia' },
    currentVersion: {
      status: 'PUBLISHED',
      slug: 'communication',
      name: 'communication',
      description: 'description of the group',
    },
    newVersion: {
      status: 'PENDING',
      slug: 'communication',
      name: 'new name',
      description: 'new description of the group',
    },
  },
  groupEdited: {
    url: 'https://www.citizenspring.be/communication',
    currentVersion: {
      status: 'PUBLISHED',
      slug: 'communication',
      name: 'communication',
      description: 'description of the group',
    },
    newVersion: {
      status: 'PENDING',
      slug: 'communication',
      name: 'new name',
      description: 'new description of the group',
    },
    posts: {
      total: 2,
      nodes: [{ PostId: 1, title: 'Post 1' }, { PostId: 2, title: 'Post 2' }],
    },
    followers: [{ name: 'Xavier' }, { name: 'Pia' }],
  },
};

export function renderTemplate(req, res) {
  const { template } = req.params;
  if (!templates[template]) {
    return res.send('please provide a valid template name');
  }
  const data = defaultData[template];
  const { subject, text, html } = render(req.params.template, data);
  return res.send(html);
}

export async function follow(email, group, PostId) {
  if (!group) {
    console.error(`follow> error: group undefined`);
    return;
  }
  debug('follow group', group.slug, 'PostId:', PostId);
  if (PostId) {
    // Follow thread
    const post = await models.Post.findByPk(PostId);
    if (!post) {
      console.error(`Can't follow PostId ${PostId}: post not found`);
      return;
    }
    const url = await post.getUrl();
    const data = {
      groupSlug: group.slug,
      url,
      post,
      unsubscribe: { label: 'Unfollow this thread', data: { PostId } },
    };
    await libemail.sendTemplate('followThread', data, email.sender);
    return;
  } else {
    // Follow group
    const data = {
      groupSlug: group.slug,
      unsubscribe: { label: 'Unfollow this group', data: { GroupId: group.GroupId } },
    };
    await libemail.sendTemplate('followGroup', data, email.sender);
    return;
  }
}
export async function edit(senderEmail, GroupId, PostId, data) {
  let target, type;
  if (PostId) {
    target = await models.Post.findByPk(PostId);
    type = 'post';
  } else {
    target = await models.Group.findByPk(GroupId);
    type = 'group';
  }
  const user = await models.User.findByEmail(senderEmail);
  const status = user.id === target.UserId ? 'PUBLISHED' : 'PENDING';
  const editedTarget = await target.edit({ ...data, status });
  const url = await target.getUrl();
  const followers = await target.getFollowers();
  const templateData = {
    url,
    type,
    user,
    currentVersion: target,
    newVersion: editedTarget,
    followers,
  };
  await libemail.sendTemplate(`${type}Edited`, templateData, senderEmail);
  if (user.id !== target.UserId) {
    const admin = await models.User.findByPk(target.UserId);

    const token = createJwt(
      'approveEdit',
      {
        data: {
          type,
          TargetId: editedTarget.id,
        },
      },
      '14d',
    );
    const token2 = createJwt(
      'alwaysApproveEdit',
      {
        data: {
          type,
          TargetId: editedTarget.id,
          always: true,
        },
      },
      '14d',
    );
    templateData.approveUrl = `${config.server.baseUrl}/api/approve?token=${token}`;
    templateData.alwaysApproveUrl = `${config.server.baseUrl}/api/approve?token=${token2}`;

    await libemail.sendTemplate(`approve${capitalize(type)}Edit`, templateData, admin.email);
  }
  return editedTarget;
}

export async function handleIncomingEmail(email) {
  const parsedEmailAddress = parseEmailAddress(email.recipient || email.recipients);
  debug('handleIncomingEmail: parsedEmailAddress', parsedEmailAddress);
  const { groupSlug, ParentPostId, PostId, action } = parsedEmailAddress;
  if (!groupSlug) {
    throw new Error(`handleIncomingEmail> cannot handle incoming email: invalid email recipient ${email.recipient}`);
  }
  const group = await models.Group.findBySlug(groupSlug, 'PUBLISHED');

  if (action) {
    if (!group) {
      throw new Error(`handleIncomingEmail> group ${groupSlug} not found`);
    }
    const data = {};
    switch (action) {
      case 'follow':
      case 'join':
      case 'subscribe':
        return follow(email.sender, group, PostId);
      case 'edit':
        if (ParentPostId) {
          data.title = email.subject;
          data.html = libemail.getHTML(email);
          data.text = email['stripped-text'];
        } else {
          data.name = email.subject;
          data.description = email['stripped-text'];
        }
        return edit(email.sender, group.id, PostId || ParentPostId, data);
    }
  }

  const post = await models.Post.createFromEmail(email);
  if (post) {
    const url = await post.getUrl();
    return url;
  } else {
    return '/';
  }
}
