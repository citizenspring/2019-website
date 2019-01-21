import config from 'config';
import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';

const domain = get(config, 'server.domain');
const baseUrl = get(config, 'server.baseUrl');

export const subject = ({ currentVersion }) => {
  return `${currentVersion.slug} group edited`;
};

const getStatusMsg = data => {
  switch (data.newVersion.status) {
    case 'PENDING':
      return 'Your modifications are pending approval from one of the group admins.';
    case 'PUBLISHED':
      return `Your modifications have been published.\n\nTitle: ${data.newVersion.name}\n\nDescription:\n${
        data.newVersion.description
      }\n`;
  }
};

export const previewText = data => {
  return getStatusMsg(data);
};

export const text = data => {
  return `${getStatusMsg(data)}
${data.url}
`;
};

export const body = data => {
  const { currentVersion, followers, posts, url } = data;
  const groupEmail = `${currentVersion.slug}@${domain}`;
  const groupUrl = `${baseUrl}/${currentVersion.slug}`;
  return (
    <Layout data={data}>
      <p>{getStatusMsg(data)}</p>
      <h2>About the {currentVersion.slug} group:</h2>
      <h3>{followers.length} followers</h3>
      <div>{followers.map(f => f.name).join(', ')}</div>
      {posts && (
        <div>
          <h3>Latest posts</h3>
          <ul>
            {posts.nodes.map(post => (
              <li>
                <a href={`${groupUrl}/${post.PostId}`}>{post.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p>You can view it online on {url}. You can also easily manage it right from your email client:</p>
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
