import React, { Component } from 'react';
import PropTypes from '../../lib/propTypes';

import { ReplyWrapper, ContentWrapper } from './Styles';
import Avatar from '../Avatar';
import Metadata from './Metadata';
import PostReactions from '../PostReactions';
import EditableText from '../EditableText';
import { mailto } from '../../lib/utils';

class Reply extends Component {
  static propTypes = {
    group: PropTypes.nodeType('Group').isRequired,
    thread: PropTypes.nodeType('Post').isRequired,
    reply: PropTypes.nodeType('Post').isRequired,
  };

  render() {
    const { group, thread, reply } = this.props;
    return (
      <ReplyWrapper>
        <Avatar user={reply.user} />
        <ContentWrapper>
          <Metadata user={reply.user.name} createdAt={reply.createdAt} />
          <EditableText
            mailto={mailto(`${group.slug}/${thread.PostId}/${reply.PostId}`, 'edit', reply.title, reply.text)}
          >
            <div dangerouslySetInnerHTML={{ __html: reply.html }} />
          </EditableText>
          {reply.html.length > 10 && <PostReactions group={group} thread={thread} reply={reply} size={16} />}
        </ContentWrapper>
      </ReplyWrapper>
    );
  }
}

export default Reply;
