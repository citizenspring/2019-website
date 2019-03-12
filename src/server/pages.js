import nextRoutes from 'next-routes';

const pages = nextRoutes();

pages
  .add('createEvent', '/:groupSlug?/events/new')
  .add('groups')
  .add('group', '/:groupSlug/:date(2[0-9]{3}-[0-9]{2}-[0-9]{2})?/:tag?')
  .add('thread', '/:groupSlug/(posts|events)/:threadSlug')
  .add('editEvent', '/:groupSlug/events/:eventSlug/edit')
  .add('index', '/');

export default pages;

export const { Link, Router } = pages;
