import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../../lib/withIntl';
import PostList from '../../containers/PostList';
import { FormattedMessage } from 'react-intl';

class PostsWithData extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const posts = this.props.data.allPosts;
    if (!posts)
      return (
        <div>
          <FormattedMessage id="loading" defaultMessage="loading" />
        </div>
      );
    return (
      <div>
        <PostList posts={posts} />
      </div>
    );
  }
}

const getDataQuery = gql`
  query allPosts($limit: Int, $offset: Int) {
    allPosts(limit: $limit, offset: $offset) {
      total
      nodes {
        id
        ... on Post {
          PostId
          title
          createdAt
          slug
          group {
            slug
          }
          parent {
            slug
          }
          user {
            id
            name
          }
          followers {
            total
          }
          replies {
            total
          }
        }
      }
    }
  }
`;

const POSTS_PER_PAGE = 20;

export const addData = graphql(getDataQuery, {
  options(props) {
    return {
      variables: {
        offset: 0,
        limit: props.limit || POSTS_PER_PAGE * 2,
      },
    };
  },
  props: ({ data }) => ({
    data,
    fetchMore: () => {
      return data.fetchMore({
        variables: {
          offset: data.allPosts.nodes.length,
          limit: POSTS_PER_PAGE,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }
          previousResult.allPosts.nodes = [...previousResult.allPosts.nodes, fetchMoreResult.allPosts.nodes];
          console.log('>>> updateQuery previousResult', previousResult, 'fetchMoreResult', fetchMoreResult);
          return previousResult;
        },
      });
    },
  }),
});

export default withIntl(addData(PostsWithData));
