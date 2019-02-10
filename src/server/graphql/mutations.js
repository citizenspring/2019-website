import { omit } from 'lodash';

import { GraphQLNonNull, GraphQLList, GraphQLString, GraphQLInt } from 'graphql';

import { NodeInterfaceType, UserType, GroupType, PostType, NodeType, MemberType, ActivityType } from './types';

import { PostInputType, UserInputType, GroupInputType, MemberInputType } from './inputTypes';
import models from '../models';

const mutations = {
  signin: {
    type: UserType,
    args: {
      user: { type: new GraphQLNonNull(UserInputType) },
    },
    async resolve(_, args, req) {
      req.remoteUser = await models.User.signin(args.user);
      return req.remoteUser;
    },
  },
  createGroup: {
    type: GroupType,
    args: {
      group: { type: new GraphQLNonNull(GroupInputType) },
    },
    resolve(_, args, req) {
      return models.Group.create(args.group);
    },
  },
  createEvent: {
    type: GroupType,
    description: 'Use this mutation to create an event and a group in the process if needed',
    args: {
      group: { type: new GraphQLNonNull(GroupInputType) },
    },
    resolve(_, args, req) {


      const user = await models.User.findOrCreate(args.group.user.email);
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
              ...omit(t.dataValues, ['id', 'createdAt', 'UserId']),
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

    },
  },
  createPost: {
    type: PostType,
    args: {
      post: { type: new GraphQLNonNull(PostInputType) },
    },
    resolve(_, args, req) {
      return models.Post.create(args.post);
    },
  },
};

export default mutations;
