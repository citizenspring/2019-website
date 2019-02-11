import config from 'config';
import { omit, pick, get } from 'lodash';
import { createJwt } from '../lib/auth';
import json2html from '../lib/json2table';
import moment from 'moment';
import libemail from '../lib/email';
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
    description: 'Create a group (type GROUP or EVENT)',
    args: {
      collective: { type: new GraphQLNonNull(GroupInputType) },
      user: { type: new GraphQLNonNull(UserInputType) },
      group: { type: new GraphQLNonNull(GroupInputType) },
      path: {
        type: GraphQLString,
        description: 'Path where the collective/group will sit (default: "/")',
      },
    },
    async resolve(_, args, req) {
      console.log('>>> createGroup', args);
      const groupData = args.group;
      const user = await models.User.findOrCreate(args.user);
      let path = args.path || '';
      let ParentGroupId;
      if (args.path) {
        const res = await models.Group.findBySlug(args.path.substr(1));
        if (res) {
          ParentGroupId = res.GroupId;
        }
      }
      let collective;
      if (args.collective) {
        const collectiveData = pick(args.collective, ['slug', 'name', 'description', 'website', 'tags', 'location']);
        // Create group for the collective that is organizing the open door event
        collectiveData.ParentGroupId = ParentGroupId;
        collectiveData.type = 'COLLECTIVE';
        collectiveData.path = path;
        collectiveData.status = 'PENDING';
        console.log('>>> creating collective', collectiveData);
        collective = await user.createGroup(collectiveData);
        path += '/' + collective.slug;
      }

      const groupName = groupData.name || `${collective.name} open door`; // move to frontend

      // Add a post to the /registrations group for notification
      const registrationsGroup = await models.Group.findByPath(path, 'registrations');
      if (registrationsGroup) {
        const postData = {
          title: groupName,
          html: json2html(groupData),
          text: JSON.stringify(groupData, null, '  '),
          GroupId: registrationsGroup.GroupId,
          tags: groupData.tags,
        };
        const post = await user.createPost(postData);
      }

      // fetch templates and copy them to the new group created (e.g. for how-to-contribute and/or code-of-conduct);
      const templatesGroup = await models.Group.findByPath(path, 'templates');
      if (templatesGroup) {
        const templates = await models.Post.findAll({
          where: { status: 'PUBLISHED', GroupId: templatesGroup.GroupId },
        });
        const promises = [];
        templates.map(t => {
          promises.push(
            user.createPost({
              ...omit(t.dataValues, ['id', 'createdAt', 'UserId']),
              GroupId: collective.GroupId,
            }),
          );
        });
        await Promise.all(promises);
      }

      // Create group for the actual event
      const inputGroupData = {
        ParentGroupId: collective ? collective.GroupId : ParentGroupId,
        name: groupName,
        slug: `${moment(groupData.startsAt).format('YYYYMMDDHHmm')}-event`,
        path,
        type: 'EVENT', // move to frontend
        description: groupData.description,
        website: groupData.website,
        tags: groupData.tags,
        startsAt: groupData.startsAt,
        endsAt: groupData.endsAt,
        location: groupData.location,
        formData: groupData.formData,
        status: 'PENDING',
      };

      console.log('>>> creating event group', inputGroupData);
      const groupCreated = await user.createGroup(inputGroupData);
      groupCreated.group = collective;
      const tokenData = { type: 'group', TargetId: collective.id, includeChildren: true };
      const token = createJwt('confirmCreateGroup', { data: tokenData }, '1h');
      const confirmationUrl = `${config.server.baseUrl}/api/approve?path=${encodeURIComponent(path)}groupSlug=${
        collective.slug
      }&token=${token}`;
      await libemail.sendTemplate(
        `confirmCreateGroup`,
        { collective, path, group: groupCreated, confirmationUrl },
        user.email,
      );
      return groupCreated;
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
