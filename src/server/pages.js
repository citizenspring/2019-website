import nextRoutes from 'next-routes';

const pages = nextRoutes();

pages
  .add('create')
  .add('groups')
  .add('group', '/:groupSlug')
  .add('thread', '/:groupSlug/:threadSlug')
  .add('subgroup', '/:groupSlug/events/:eventSlug', 'group')
  .add('index', '/');

export default pages;

export const { Link, Router } = pages;
