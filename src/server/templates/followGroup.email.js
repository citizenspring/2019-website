import env from '../env';
import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';
import settings from '../../../settings.json';

export const subject = ({ groupSlug }) => {
  return `You are now following ${groupSlug}@${env.DOMAIN}`;
};

export const previewText = ({ groupSlug }) => {
  return `You will now receive all new emails sent to the ${groupSlug}@${env.DOMAIN} mailing list`;
};

export const body = data => {
  const { groupSlug } = data;
  return (
    <Layout data={data}>
      <p>
        You are now following the <a href={`${env.BASE_URL}/${groupSlug}`}>{groupSlug}</a> group of the $
        {get(settings, 'name')} collective. All new emails sent to {groupSlug}@{env.DOMAIN} will now also be sent to
        you.
      </p>
      <p>
        Please note that in order to preserve your inbox, you will only receive replies to threads that you have replied
        to or that you have explicitly asked to follow (there is a follow link at the bottom of every new email sent to
        the group).
      </p>
      <p>If this is an error, click on the link below to unfollow this mailing list.</p>
    </Layout>
  );
};
