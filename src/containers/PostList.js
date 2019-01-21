import React, { Component } from 'react';
import PropTypes from '../lib/propTypes';
import styled from 'styled-components';
// import Spinner from 'react-spinkit';

import PostListItem from '../components/PostItem';
import { FormattedMessage } from 'react-intl';

const Wrapper = styled.div`
  margin: 0px;
`;
const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
`;

export default class PostList extends Component {
  static propTypes = {
    posts: PropTypes.nodeList.isRequired,
  };
  render() {
    const { posts } = this.props;

    if (posts.total === 0) {
      return (
        <div>
          <FormattedMessage id="postlist.empty" defaultMessage="No thread yet" />
        </div>
      );
    } else if (posts.total > 0) {
      return this.renderList(posts);
    } else
      return (
        <LoadingWrapper>
          <FormattedMessage id="loading" defaultMessage="loading" />
          {/* <Spinner name="ball-grid-pulse" fadeIn="none" /> */}
        </LoadingWrapper>
      );
  }

  renderList(posts) {
    return (
      <Wrapper>
        {posts.nodes.map((item, i) => (
          <PostListItem
            key={i}
            post={item}
            repliesCount={item.replies.total}
            followersCount={item.followers.total}
            groupSlug={this.props.groupSlug}
          />
        ))}
      </Wrapper>
    );
  }
}
