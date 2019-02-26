import React, { Component } from 'react';
import PropTypes from '../../lib/propTypes';

import { PostWrapper, ContentWrapper } from './Styles';
import PostHeader from './PostHeader';
import PostReactions from '../PostReactions';
import RichText from '../RichText';
import { mailto, keepAnchorsShort, getDomain } from '../../lib/utils';
import env from '../../env.frontend';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import { Subtitle } from '../../styles/layout';

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
      <PostWrapper id={post.PostId}>
        <ContentWrapper>
          {thread.PostId !== post.PostId && (
            <PostHeader
              type={post.type}
              reaction={reaction}
              user={post.user}
              createdAt={post.createdAt}
              editUrl={mailto(
                `${group.slug}/${thread.type.toLowerCase()}s/${thread.PostId}/${post.PostId}@${env.DOMAIN}`,
                'edit',
                post.title,
                post.text,
                post.tags,
              )}
            />
          )}
          {!reaction && (
            <div>
              <RichText html={html} />
              {post.website && (
                <FormattedMessage
                  id="event.viewWebsite"
                  defaultMessage="View event on {website}"
                  values={{ website: <a href={post.website}>{getDomain(post.website)}</a> }}
                />
              )}
              {thread.PostId === post.PostId && get(thread, 'formData.collectiveDescription') && (
                <div>
                  <Subtitle>
                    <FormattedMessage id="event.aboutCollective" defaultMessage="About our collective" />
                  </Subtitle>
                  <p>{thread.formData.collectiveDescription}</p>
                  <FormattedMessage
                    id="event.collectiveWebsite"
                    defaultMessage="Visit our website on {website}"
                    values={{
                      website: (
                        <a href={thread.formData.collectiveWebsite}>{getDomain(thread.formData.collectiveWebsite)}</a>
                      ),
                    }}
                  />
                </div>
              )}
              {thread.type === 'POST' && post.html.length > 14 && (
                <PostReactions group={group} thread={thread} reply={post} size={16} />
              )}
            </div>
          )}
        </ContentWrapper>
      </PostWrapper>
    );
  }
}

export default Post;
