import config from 'config';
import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';
import { quoteEmail } from '../lib/email';

export const subject = () => {
  return `Confirmation of your registration to Citizen Spring`;
};

export const previewText = ({ groupSlug }) => {
  return `Your registration has been recorded.`;
};

export const text = ({ form, text, url }) => {
  return `Hi there! 👋<

Thank you for registering your open door. If you have any questions, just reply to this email.
If you want to edit your registration, you can do so on ${url}.
- The Citizen Spring team
`;
};

export const body = data => {
  const { url, form, posts } = data;
  const getPostUrl = post => `${get(config, 'server.baseUrl')}/${form.slug}/${post.slug}`;
  return (
    <Layout data={data}>
      <p>Hi there! 👋</p>
      <p>Thank you for registering your open door. If you have any questions, just reply to this email.</p>
      <p>If you want to edit your registration, you can do so on {url}.</p>
      <p>You now also have a special page on citizenspring.be/{form.slug} that you can edit to present yourselve.</p>
      {posts && (
        <div>
          <p>We've already posted some posts on your page that we invite you to look at and edit:</p>
          <ul>
            {posts.map(post => (
              <li>
                <a href={getPostUrl(post)}>{post.title}</a>
                <br />
                {post.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p>- The Citizen Spring team</p>
    </Layout>
  );
};
