import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { ListItemWrapper } from './Styles';
import Title from './Title';
import Metadata from './Metadata';

class PostListItem extends Component {
  static propTypes = {
    post: PropTypes.object.isRequired,
    groupSlug: PropTypes.string.isRequired,
    repliesCount: PropTypes.number,
    followersCount: PropTypes.number,
  };

  render() {
    const { groupSlug, post, followersCount, repliesCount } = this.props;
    let path = `/${groupSlug || get(post, 'group.slug')}/${get(post, 'parent.slug', post.slug)}`;
    if (get(post, 'parent.slug')) {
      path += `#${post.PostId}`;
    }
    if (!post.user) {
      console.error('PostItem> Invalid post: missing post.user', post);
      return <div />;
    }
    return (
      <ListItemWrapper>
        <Title title={post.title} path={path} createdAt={post.createdAt} />
        <Metadata
          user={post.user.name}
          createdAt={post.createdAt}
          group={post.group}
          followersCount={followersCount}
          repliesCount={repliesCount}
        />
      </ListItemWrapper>
    );
  }
}

export default PostListItem;
