import env from '../env';
import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';

const domain = env.DOMAIN;
const baseUrl = env.BASE_URL;

export const subject = ({ group }) => {
  return `${group.slug} group info`;
};

export const previewText = ({ group, followers, posts }) => {
  return `${group.slug}@${domain} has ${followers.length} followers and ${posts.total} posts`;
};

export const body = data => {
  const { group, followers, posts } = data;
  const groupEmail = `${group.slug}@${domain}`;
  const groupUrl = `${baseUrl}/${group.slug}`;
  return (
    <Layout data={data}>
      <p>About the {group.slug} group:</p>
      <h3>{followers.length} followers</h3>
      <div>{followers.map(f => f.name).join(', ')}</div>
      <h3>Latest posts</h3>
      <ul>
        {posts.nodes.map(post => (
          <li>
            <a href={`${groupUrl}/${post.PostId}`}>{post.title}</a>
          </li>
        ))}
      </ul>
      <p>
        You can view it online on {baseUrl}/{group.slug}. You can also easily manage it right from your email client:
      </p>
      <h3>How to add people?</h3>
      <p>
        Anyone can start following this group by sending an empty email to {groupEmail}. Alternatively, you can also
        reply to this email and cc the people that you want to add to the group.
      </p>
      <h3>How to remove people?</h3>
      <p>
        Any time you receive an email, there is a link in the footer to unsubscribe (either from new emails sent to the
        group or from new emails in a given thread).
      </p>
    </Layout>
  );
};
