import config from 'config';
import templates, { render } from '../../server/templates';
import models from '../models';
import { isEmpty, extractNamesAndEmailsFromString, parseEmailAddress, capitalize } from '../lib/utils';
import libemail from '../lib/email';
import { createJwt } from '../lib/auth';
import debugLib from 'debug';
const debug = debugLib('email');
import yaml from 'js-yaml';
import { get, pick, omit } from 'lodash';
import json2html from '../lib/json2table';
import moment from 'moment';

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

export async function follow(senderEmail, group, PostId) {
  if (!group) {
    console.error(`follow> error: group undefined`);
    return;
  }
  debug('follow group', group.slug, 'PostId:', PostId);
  if (PostId) {
    // Follow thread
    const post = await models.Post.findOne({ where: { PostId, status: 'PUBLISHED' } });
    if (!post) {
      console.error(`Can't follow PostId ${PostId}: post not found`);
      return;
    }
    await post.addFollowers([{ email: senderEmail }]);
    const url = await post.getUrl();
    const data = {
      groupSlug: group.slug,
      url,
      post,
      unsubscribe: { label: 'Unfollow this thread', data: { PostId } },
    };
    await libemail.sendTemplate('followThread', data, senderEmail);
    return `/${group.slug}/${post.slug}`;
  } else {
    // Follow group
    await group.addFollowers([{ email: senderEmail }]);
    const data = {
      groupSlug: group.slug,
      unsubscribe: { label: 'Unfollow this group', data: { GroupId: group.GroupId } },
    };
    await libemail.sendTemplate('followGroup', data, senderEmail);
    return `/${group.slug}`;
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

export async function submit(senderEmail, group, text) {
  const yamlText = text.substring(text.indexOf('---') + 3, text.lastIndexOf('---'));
  console.log('>>> yamlText', yamlText);
  let form = {};
  try {
    form = yaml.safeLoad(yamlText);
  } catch (e) {
    throw new Error('Unable to parse your form application');
  }
  console.log('>>> form', form);
  if (!form.slug) {
    throw new Error('Unable to parse your form application: missing data');
  }
  const user = await models.User.findByEmail(senderEmail);
  const location = {};
  if (form.location) {
    location.locationName = form.location.name;
    location.addressLine1 = form.location.address;
    location.zipcode = form.location.zipcode;
    location.countryCode = form.location.countryCode;
    location.city = form.location.city;
    location.geoLocationLatLong = { type: 'Point', coordinates: [form.location.lat, form.location.long] };
  }
  const newGroupData = {
    ...pick(form, ['slug', 'name', 'description', 'website', 'tags']),
    ...location,
  };
  const newGroup = await user.createGroup(newGroupData);
  const postData = {
    title: form.name,
    html: json2html(form),
    text: yamlText,
    GroupId: group.GroupId,
    tags: form.tags,
  };
  const templatesGroup = await models.Group.findBySlug('templates');
  if (templatesGroup) {
    const templates = await models.Post.findAll({ where: { status: 'PUBLISHED', GroupId: templatesGroup.GroupId } });
    const promises = [];
    templates.map(t => {
      promises.push(
        user.createPost({
          ...omit(t.dataValues, ['id']),
          GroupId: newGroup.GroupId,
        }),
      );
    });
    await Promise.all(promises);
  }
  const post = await user.createPost(postData);
  const startsAtDate = form.startsAt.replace(/.*[^\d]([0-9]+)[^\d].*/, '$1');
  const startsAt = new Date(`2019-03-${startsAtDate} ${form.startsAtTime.replace('h', ':00')}`);
  const endsAt = new Date(`2019-03-${startsAtDate} ${form.endsAtTime.replace('h', ':00')}`);
  const eventGroupData = {
    ParentGroupId: newGroup.GroupId,
    name: `${form.name} open door`,
    slug: `${form.slug}/events/${moment(startsAt).format('YYYYMMDDHHmm')}`,
    type: 'EVENT',
    description: form.eventDescription,
    website: form.website,
    tags: form.tags,
    ...location,
    startsAt,
    endsAt,
  };
  await user.createGroup(eventGroupData);
  const posts = await models.Post.findAll({ where: { status: 'PUBLISHED', GroupId: newGroup.GroupId } });
  await libemail.sendTemplate(
    `formSubmitted`,
    { posts, form, url: `${get(config, 'server.baseUrl')}/${group.slug}/${post.slug}` },
    senderEmail,
  );
}

export async function handleIncomingEmail(email) {
  const parsedEmailAddress = libemail.parseHeaders(email);

  debug('handleIncomingEmail: parsedEmailAddress', parsedEmailAddress);
  const { recipients, tags, groupSlug, action, ParentPostId, PostId } = parsedEmailAddress;
  if (!groupSlug || !email.From) {
    throw new Error(`handleIncomingEmail> cannot handle incoming email: invalid email object`);
  }

  const userData = extractNamesAndEmailsFromString(email.From)[0];
  const user = await models.User.findOrCreate(userData);
  // if we didn't have the name of the user before (i.e. because added by someone else just by email),
  // we add it
  if (user.name === 'anonymous' && userData.name) {
    user.setName(userData.name);
  }

  let group = await models.Group.findBySlug(groupSlug, 'PUBLISHED');

  // If the group doesn't exist, we create it and add the recipients as admins and followers
  if (!group) {
    group = await user.createGroup({ slug: groupSlug, name: groupSlug, tags });
    await group.addMembers(recipients, { role: 'ADMIN' });
    await group.addFollowers(recipients);
    const followers = await group.getFollowers();
    await libemail.sendTemplate('groupCreated', { group, followers }, user.email);
    // if the email is empty or is the default email, we don't create the post
    if (email.subject === 'Create a new working group' || isEmpty(email.subject) || isEmpty(email['stripped-text'])) {
      return `/${group.slug}`;
    }
  } else {
    // If the group exists and if the email is empty,
    if (isEmpty(email.subject) || isEmpty(email['stripped-text'])) {
      // we add the sender and recipients as followers of the group
      await group.addFollowers([...recipients, userData]);
      // we send an update about the group info
      const followers = await group.getFollowers();
      const posts = await group.getPosts();
      await libemail.sendTemplate('groupInfo', { group, followers, posts }, user.email);
      return `/${group.slug}`;
    }
  }

  if (action) {
    const data = {};
    switch (action) {
      case 'submit':
        return submit(email.sender, group, email['stripped-text']);
      case 'follow':
      case 'join':
      case 'subscribe':
        return follow(email.sender, group, ParentPostId);
      case 'edit':
        if (ParentPostId) {
          data.title = email.subject;
          data.html = libemail.getHTML(email);
          data.text = email['stripped-text'];
        } else {
          data.name = email.subject;
          data.description = email['stripped-text'];
        }
        const editedPost = await edit(email.sender, group.id, PostId || ParentPostId, data);
        return `/${group.slug}/${editedPost.slug}`;
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
