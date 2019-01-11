import config from 'config';
import templates, { render } from '../../server/templates';
import models from '../models';
import { parseEmailAddress } from '../lib/utils';
import libemail from '../lib/email';
import { createJwt } from '../lib/auth';

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
  groupEdited: {
    url: 'https://www.citizenspring.be/communication',
    group: {
      status: 'PENDING',
      slug: 'communication',
      name: 'communication',
      description: 'description of the group',
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
    console.error(`Can't follow ${groupSlug}: group not found`);
    return;
  }
  if (PostId) {
    // Follow thread
    const post = await models.Post.findById(PostId);
    if (!post) {
      console.error(`Can't follow PostId ${PostId}: post not found`);
      return;
    }
    const url = await post.getUrl();
    const data = {
      groupSlug,
      url,
      post,
      unsubscribe: { label: 'Unfollow this thread', data: { PostId } },
    };
    await libemail.sendTemplate('followThread', data, email.sender);
    return;
  } else {
    // Follow group
    const data = {
      groupSlug,
      unsubscribe: { label: 'Unfollow this group', data: { GroupId: group.GroupId } },
    };
    await libemail.sendTemplate('followGroup', data, email.sender);
    return;
  }
}
export async function edit(email, GroupId, PostId, data) {
  let target, type;
  if (PostId) {
    target = await models.Post.findById(PostId);
    type = 'post';
  } else {
    target = await models.Group.findById(GroupId);
    type = 'group';
  }
  const user = await models.User.findByEmail(email);
  const status = user.id === target.UserId ? 'PUBLISHED' : 'PENDING';
  const editedTarget = await target.edit({ ...data, status });
  const url = await target.getUrl();
  const followers = await target.getFollowers();
  const templateData = {
    url,
    type,
    user,
    [type]: editedTarget,
    followers,
  };
  await libemail.sendTemplate(`${type}Edited`, templateData, email.sender);
  if (user.id !== target.UserId && type === 'group') {
    // TODO: add support for edit Post
    const admin = await models.User.findById(target.UserId);

    const tokenData = {
      type,
      [type]: { id: editedTarget.id },
    };
    const token = createJwt('approveEdit', { data: tokenData }, '14d');
    templateData.confirmationUrl = `${config.server.baseUrl}/api/approve?token=${token}`;

    await libemail.sendTemplate(`approveGroupEdit`, templateData, admin.email);
  }
  return editedTarget;
}

export async function handleIncomingEmail(email) {
  const { groupSlug, ParentPostId, PostId, action } = parseEmailAddress(email.recipient || email.recipients);
  if (!groupSlug) {
    throw new Error(`cannot handle incoming email: invalid email recipient ${email.recipient}`);
  }
  const group = await models.Group.findBySlug(groupSlug);

  switch (action) {
    case 'follow':
    case 'join':
    case 'subscribe':
      return follow(email.sender, group, PostId);
    case 'edit':
      const data = { html: email['stripped-html'], text: email['stripped-text'] };
      return edit(email.sender, group.id, PostId, data);
  }

  const post = await models.Post.createFromEmail(email);
  if (post) {
    const url = await post.getUrl();
    return url;
  } else {
    return '/';
  }
}
