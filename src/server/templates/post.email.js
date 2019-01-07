import React from 'react';
import Layout from './email.layout';
import { get } from 'lodash';
import config from 'config';
import Oy from 'oy-vey';
import withIntl from '../../lib/withIntl';
import { FormattedMessage } from 'react-intl';

const { Table, TBody, TR, TD } = Oy;

const styles = {
  reactions: {
    marginTop: '2rem',
  },
  reaction: {
    fontSize: '22px',
    textDecoration: 'none',
    display: 'box',
    margin: '10px',
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

export const Reaction = ({ emoji, threadEmail, subject }) => {
  const replyEmail = body => {
    return `${threadEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <TD>
      <a href={`mailto:${replyEmail(emoji)}`} style={styles.reaction}>
        {emoji}
      </a>
    </TD>
  );
};

export const body = withIntl(data => {
  const { groupSlug, post } = data;
  const threadEmail = `${groupSlug}/${post.ParentPostId || post.PostId}@${get(config, 'server.domain')}`;
  return (
    <Layout data={data}>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <Table style={styles.reactions}>
        <TBody>
          <TR>
            <TD style={styles.pickReaction}>
              <FormattedMessage id="emails.post.pickReaction" defaultMessage="Pick a quick reaction (or hit reply)" />
            </TD>
            {['👍', '👎', '😄', '😕', '🎉', '❤️'].map((emoji, i) => (
              <Reaction key={i} emoji={emoji} threadEmail={threadEmail} subject={`Re: ${post.title}`} />
            ))}
          </TR>
        </TBody>
      </Table>
    </Layout>
  );
});
