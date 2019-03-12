import { GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLBoolean } from 'graphql';

import { NodeListType, UserType, GroupType, PostType, NodeType, MemberType, ActivityType } from './types';

import models, { sequelize, Op } from '../models';

const getIdFromSlug = async function(table, slug) {
  const canonicalIdCol = `${table}Id`;
  const item = await models[table].findOne({ attributes: ['id', canonicalIdCol], where: { slug: slug.toLowerCase() } });
  if (!item) throw Error(`Cannot find ${table} with slug ${slug}`);
  return item[canonicalIdCol];
};

const queries = {
  /*
   * Given a GroupSlug, returns all Posts
   */
  allPosts: {
    type: NodeListType,
    args: {
      groupSlug: { type: GraphQLString },
      hasLocation: {
        type: GraphQLBoolean,
        description: 'only return posts that have a location',
      },
      date: { type: GraphQLString },
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
    },
    async resolve(_, args) {
      const query = { where: { status: 'PUBLISHED' } };
      if (args.groupSlug) {
        const GroupId = await getIdFromSlug('Group', args.groupSlug);
        query.where.GroupId = GroupId;
      }
      if (args.date) {
        const startsAt = new Date(args.date);
        startsAt.setHours(0);
        startsAt.setMilliseconds(0);
        const endsAt = new Date(startsAt);
        endsAt.setDate(startsAt.getDate() + 1);
        query.where.startsAt = { [Op.gte]: startsAt };
        query.where.endsAt = { [Op.gte]: endsAt };
      }
      query.where.ParentPostId = { [Op.is]: null };
      query.limit = args.limit || 20;
      query.offset = args.offset || 0;
      query.order = [['createdAt', 'DESC']];
      const { count, rows } = await models.Post.findAndCountAll(query);
      const res = {
        total: count,
        nodes: rows,
        limit: query.limit,
        offset: query.offset,
      };
      return res;
    },
  },

  Post: {
    type: PostType,
    args: {
      PostId: { type: GraphQLInt },
      postSlug: { type: GraphQLString },
    },
    resolve: async (_, args) => {
      const PostId = args.PostId || (await getIdFromSlug('Post', args.postSlug));
      const post = await models.Post.findOne({
        where: { PostId: PostId, status: 'PUBLISHED' },
      });
      return post;
    },
  },

  Group: {
    type: GroupType,
    args: {
      groupSlug: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (_, args) => {
      return await models.Group.findBySlug(args.groupSlug, 'PUBLISHED');
    },
  },

  allGroups: {
    type: NodeListType,
    args: {
      type: {
        type: GraphQLString,
        description: 'type of group to return (GROUP or EVENT). Default: ALL',
      },
      tags: { type: new GraphQLList(GraphQLString), description: 'filter by tags (AND)' },
      limit: { type: GraphQLInt },
      offset: { type: GraphQLInt },
    },
    async resolve(_, args) {
      const query = { where: { status: 'PUBLISHED' } };
      if (args.type) {
        query.where.type = args.type;
      }
      if (args.tags) {
        query.where.tags = { [Op.contains]: args.tags };
      }
      query.limit = args.limit || 20;
      query.offset = args.offset || 0;
      query.order = [['name', 'ASC']];
      const { count, rows } = await models.Group.findAndCountAll(query);
      const res = {
        total: count,
        nodes: rows,
        limit: query.limit,
        offset: query.offset,
      };
      console.log('>>> res', res);
      return res;
    },
  },
};

export default queries;
