import React, { Component } from 'react';
import PropTypes from '../../lib/propTypes';

import { PostWrapper, ContentWrapper } from './Styles';
import PostHeader from './PostHeader';
import PostReactions from '../PostReactions';
import EditableText from '../EditableText';
import { mailto, keepAnchorsShort } from '../../lib/utils';
import env from '../../env.frontend';

class Post extends Component {
  static propTypes = {
    group: PropTypes.nodeType('Group').isRequired,
    thread: PropTypes.nodeType('Post').isRequired,
    post: PropTypes.nodeType('Post').isRequired,
  };

  render() {
    const { group, thread, post } = this.props;
    let reaction;
    if (post.text.length === 2) {
      reaction = post.text;
    }
    const html = keepAnchorsShort(post.html);
    return (
      <PostWrapper>
        <ContentWrapper>
          {thread.PostId !== post.PostId && (
            <PostHeader reaction={reaction} user={post.user} createdAt={post.createdAt} />
          )}
          {!reaction && (
            <div>
              <EditableText
                mailto={mailto(
                  `${group.slug}/${thread.PostId}/${post.PostId}@${env.DOMAIN}`,
                  'edit',
                  post.title,
                  post.text,
                )}
              >
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </EditableText>
              {post.html.length > 14 && <PostReactions group={group} thread={thread} post={post} size={16} />}
            </div>
          )}
        </ContentWrapper>
      </PostWrapper>
    );
  }
}

export default Post;
