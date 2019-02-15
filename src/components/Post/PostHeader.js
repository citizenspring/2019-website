import React from 'react';
import PropTypes from '../../lib/propTypes';
import Moment from 'react-moment';
import Avatar from '../Avatar';

import { PostHeaderWrapper, Metadata, Reaction } from './Styles';

export default function PostHeader(props) {
  const timestamp = new Date(Number(props.createdAt));
  let str = props.reaction ? 'reacted' : 'replied';
  if (props.type === 'EVENT') {
    str = 'submitted';
  }
  return (
    <PostHeaderWrapper>
      {props.reaction && <Reaction>{props.reaction}</Reaction>}
      {!props.reaction && <Avatar user={props.user} />}
      <Metadata>
        {props.user.name} {str} <Moment fromNow>{timestamp}</Moment>
      </Metadata>
    </PostHeaderWrapper>
  );
}

PostHeader.propTypes = {
  user: PropTypes.nodeType('User').isRequired,
  createdAt: PropTypes.string.isRequired,
};
