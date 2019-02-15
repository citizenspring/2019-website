import config from 'config';
import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';
import { quoteEmail } from '../lib/email';

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

export const subject = () => {
  return `Confirmation of your registration to Citizen Spring`;
};

export const previewText = ({ post }) => {
  return `Your registration has been recorded.`;
};

export const text = ({ post, confirmationUrl }) => {
  return `Hi there! 👋<

Please confirm the registration of your open door by opening this url:
${confirmationUrl}

- The Citizen Spring collective
`;
};

export const body = data => {
  const { confirmationUrl, post } = data;
  return (
    <Layout data={data}>
      <p>Hi there! 👋</p>
      <p>Please confirm the registration of your open door. If you have any questions, just reply to this email.</p>
      <p>You will be able to edit the details of your registration once your registration is confirmed.</p>
      <center>
        <a style={styles.btn} href={confirmationUrl}>
          Confirm your registration
        </a>
      </center>

      <p>- The Citizen Spring collective</p>
    </Layout>
  );
};
