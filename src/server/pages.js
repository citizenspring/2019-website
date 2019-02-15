import nextRoutes from 'next-routes';

const pages = nextRoutes();

pages
  .add('createEvent', '/:groupSlug?/events/new')
  .add('groups')
  .add('group', '/:groupSlug/:tag?')
  .add('thread', '/:groupSlug/(posts|events)/:threadSlug')
  .add('index', '/');

export default pages;

export const { Link, Router } = pages;
