import React from 'react';
import styled from 'styled-components';
import emojis from '../constants/emojis';
import { mailto } from '../lib/utils';
import env from '../env.frontend';

const Wrapper = styled.div`
  margin: 1rem 0;
  display: flex;
`;

const Emoji = styled.div`
  margin: ${({ size }) => `0 ${size > 20 ? '1rem' : '0.5rem'}`};
  font-size: ${({ size }) => `${size}px`};
`;

const Actions = styled.div`
  display: flex;
`;

export default function PostReactions({ group, thread, reply, size }) {
  if (!thread) return <div />;
  const postEmail = `${group.slug}/${reply ? `${thread.PostId}/${reply.PostId}` : thread.PostId}@${env.DOMAIN}`;
  const subject = `Re: ${thread.title}`;
  return (
    <Wrapper>
      {emojis.map((emoji, i) => (
        <Emoji key={i} size={size}>
          <a href={mailto(postEmail, null, subject, emoji)}>{emoji}</a>
        </Emoji>
      ))}
    </Wrapper>
  );
}
