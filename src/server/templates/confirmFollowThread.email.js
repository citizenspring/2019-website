import React from 'react';
import Layout from './email.layout';
import settings from '../../../settings.json';

const styles = {
  btn: {
    display: 'block',
    maxWidth: '240px',
    borderRadius: '16px',
    backgroundColor: '#3399FF',
    color: 'white',
    textDecoration: 'none',
    padding: '5px 10px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disclaimer: {
    color: '#555',
    fontSize: '12px',
  },
};

export const subject = ({ post }) => {
  return `Action required: please confirm to follow the thread ${post.title}`;
};

export const previewText = ({ post }) => {
  return `You are one click away from following the the thread ${post.title}`;
};

export const body = data => {
  const { post, confirmationUrl } = data;
  return (
    <Layout data={data}>
      <p>
        As a friendly reminder, please make sure that you read the{' '}
        <a href={settings.code_of_conduct}>Code Of Conduct</a>. All replies sent to this thread are published on{' '}
        <a href={post.url}>{post.url}</a>.
      </p>
      <p>To continue, click on the button below.</p>
      <center>
        <a style={styles.btn} href={confirmationUrl}>
          Follow this thread
        </a>
      </center>
      <p style={styles.disclaimer}>
        Note: If you'd like to use another identity, we recommend that you send your email from a different email
        address.
      </p>
    </Layout>
  );
};
