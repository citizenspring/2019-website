import React from 'react';
import Layout from './email.layout';
import withIntl from '../../lib/withIntl';
import { quoteEmail } from '../lib/email';

export const subject = ({ subject }) => {
  return subject;
};

export const text = ({ body, email }) => {
  return `${body}

${email && quoteEmail(email)}
`;
};

export const body = withIntl(data => {
  return (
    <Layout data={data}>
      <div dangerouslySetInnerHTML={{ __html: data.body }} />
      {data.email && quoteEmail(data.email, 'html')}
    </Layout>
  );
});
