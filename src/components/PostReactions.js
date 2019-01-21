import React from 'react';
import styled from 'styled-components';
import emojis from '../constants/emojis';
import { mailto } from '../lib/utils';
import env from '../env.frontend';
import withIntl from '../lib/withIntl';
import { defineMessages } from 'react-intl';

const Wrapper = styled.div`
  margin: 1rem 0;
  display: flex;
`;

const Emoji = styled.div`
  margin: ${({ size }) => `0 ${size > 20 ? '1rem' : '0.5rem'}`};
  font-size: ${({ size }) => `${size}px`};
`;

const Label = styled.div`
  color: #666;
  margin-right: 0.5rem;
`;

function PostReactions({ intl, group, thread, reply, size }) {
  if (!thread) return <div />;
  const messages = defineMessages({
    title: { id: 'post.reactions.title', defaultMessage: 'Pick a reaction' },
  });
  const postEmail = `${group.slug}/${reply ? `${thread.PostId}/${reply.PostId}` : thread.PostId}@${env.DOMAIN}`;
  const subject = `Re: ${thread.title}`;
  return (
    <Wrapper>
      <Label>{intl.formatMessage(messages.title)}: </Label>
      {emojis.map((emoji, i) => (
        <Emoji key={i} size={size}>
          <a href={mailto(postEmail, null, subject, emoji)} title={intl.formatMessage(messages.title)}>
            {emoji}
          </a>
        </Emoji>
      ))}
    </Wrapper>
  );
}

export default withIntl(PostReactions);
