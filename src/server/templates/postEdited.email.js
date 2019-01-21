import React from 'react';
import Layout from './email.layout';

export const subject = ({ currentVersion }) => {
  return `${currentVersion.title} post edited`;
};

const getStatusMsg = status => {
  switch (status) {
    case 'PENDING':
      return 'Your modifications are pending approval from one of the post admins.';
    case 'PUBLISHED':
      return 'Your modifications have been published.';
  }
};

export const previewText = ({ newVersion }) => {
  return getStatusMsg(newVersion.status);
};

export const body = data => {
  const { newVersion } = data;
  return (
    <Layout data={data}>
      <p>{getStatusMsg(newVersion.status)}</p>
    </Layout>
  );
};
