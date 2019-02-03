import nextRoutes from 'next-routes';

const pages = nextRoutes();

pages
  .add('groups')
  .add('group', '/:groupSlug')
  .add('thread', '/:groupSlug/:threadSlug')
  .add('index', '/');

export default pages;

export const { Link, Router } = pages;
