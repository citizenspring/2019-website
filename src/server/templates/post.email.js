import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';
import config from 'config';
import Oy from 'oy-vey';
import withIntl from '../../lib/withIntl';
import { FormattedMessage } from 'react-intl';
import emojis from '../../constants/emojis';
import { mailto } from '../../lib/utils';

const { Table, TBody, TR, TD } = Oy;

const styles = {
  reactions: {
    marginTop: '2rem',
  },
  emoji: {
    fontSize: '28px',
    textDecoration: 'none',
    display: 'box',
    margin: '13px',
  },
  pickReaction: {
    color: '#555',
    lineHeight: '28px',
    fontSize: '14px',
  },
};

export const subject = ({ post: { title } }) => {
  return title;
};

export const text = ({ subscribe, unsubscribe, post: { text } }) => {
  const subscribeTxt = subscribe ? `${subscribe.label}\n${subscribe.url}\n` : '';
  const unsubscribeTxt = unsubscribe ? `${unsubscribe.label}\n${unsubscribe.url}\n` : '';

  return `${text}


---
${subscribeTxt}
${unsubscribeTxt}
`;
};

export const Reaction = ({ emoji, postEmail, subject }) => {
  return (
    <TD>
      <a href={mailto(postEmail, null, subject, emoji)} style={styles.emoji}>
        {emoji}
      </a>
    </TD>
  );
};

export const body = withIntl(data => {
  const { groupSlug, post } = data;
  let postEmail = `${groupSlug}/`;
  if (post.ParentPostId) {
    postEmail += `${post.ParentPostId}/${post.PostId}`;
  } else {
    postEmail += post.PostId;
  }
  postEmail += `@${get(config, 'server.domain')}`;

  return (
    <Layout data={data}>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <Table style={styles.reactions}>
        <TBody>
          <TR>
            <TD colSpan={6} style={styles.pickReaction}>
              <FormattedMessage id="emails.post.pickReaction" defaultMessage="Pick a quick reaction (or hit reply)" />
            </TD>
          </TR>
          <TR>
            {emojis.map((emoji, i) => (
              <Reaction key={i} emoji={emoji} postEmail={postEmail} subject={`Re: ${post.title}`} />
            ))}
          </TR>
        </TBody>
      </Table>
    </Layout>
  );
});
