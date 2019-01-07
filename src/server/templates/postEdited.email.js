import React from 'react';
import Layout from './email.layout';

export const subject = ({ post }) => {
  return `${post.title} post edited`;
};

const getStatusMsg = status => {
  switch (status) {
    case 'PENDING':
      return 'Your modifications are pending approval from one of the post admins.';
    case 'PUBLISHED':
      return 'Your modifications have been published.';
  }
};

export const previewText = ({ post }) => {
  return getStatusMsg(post.status);
};

export const body = data => {
  const { post } = data;
  return (
    <Layout data={data}>
      <p>{getStatusMsg(post.status)}</p>
    </Layout>
  );
};
