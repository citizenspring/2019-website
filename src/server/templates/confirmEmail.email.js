import env from '../env';
import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';
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

export const subject = () => {
  return `Action required: your email is pending`;
};

export const previewText = ({ groupSlug }) => {
  return `Please confirm sending your email to ${groupSlug}@${env.DOMAIN}`;
};

export const text = ({ groupSlug, confirmationUrl, post, action }) => {
  const groupUrl = `${env.BASE_URL}/${groupSlug}`;
  return `Hi there! 👋<

Since this is the first time you that are sending an email to the ${get(
    settings,
    'name',
  )} collective, we ask you to kindly confirm that you are a human ☺️ We also want to make sure that you understand that all emails sent to this email address are published publicly on ${groupUrl}

To ${action.label.toLowerCase()}, click on the link below:
${confirmationUrl}


Note: If you'd like to use another identity, we recommend that you send your email from a different email address.


> ${post.text.split('\n').join('\n> ')}
`;
};

export const body = data => {
  const { groupSlug, confirmationUrl, post, action } = data;
  const groupUrl = `${env.BASE_URL}/${groupSlug}`;
  return (
    <Layout data={data}>
      <p>Hi there! 👋</p>
      <p>
        Since this is the first time you that are sending an email to the {get(settings, 'name')} collective, we ask you
        to kindly confirm that you are a human ☺️🤖
      </p>
      <p>
        We also want to make sure that you understand that all emails sent to this email address are published publicly
        on <a href={groupUrl}>{groupUrl}</a>.
      </p>
      <p>To continue, click on the button below.</p>
      <center>
        <a style={styles.btn} href={confirmationUrl}>
          {action.label}
        </a>
      </center>
      <p style={styles.disclaimer}>
        Note: If you'd like to use another identity, we recommend that you send your email from a different email
        address.
      </p>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  );
};
