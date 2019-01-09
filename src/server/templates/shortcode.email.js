import { get } from 'lodash';
import React from 'react';
import settings from '../../../settings.json';

import Layout from './email.layout';

export const subject = ({ shortcode }) => {
  return `Signing in to ${get(settings, 'name')}`;
};

export const body = data => {
  const { shortcode } = data;
  return (
    <Layout data={data}>
      <div>
        Your short code is
        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{shortcode}</div>
      </div>
    </Layout>
  );
};
