import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../lib/withIntl';
import Metadata from '../components/PostItem/Metadata';
import Reply from '../components/Reply/ReplyItem';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { Content } from '../styles/layout';
import { PostBody } from '../styles/Post';
import TitleWithActions from '../components/TitleWithActions';
import PostReactions from '../components/PostReactions';
import env from '../env.frontend';
import { mailto } from '../lib/utils';
import EditableText from '../components/EditableText';

class ThreadPage extends React.Component {
  static propTypes = {
    threadSlug: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const post = this.props.data.Post;
    if (!post) {
      return <div>Loading</div>;
    }
    const postEmail = `${post.group.slug}/${post.PostId}@${env.DOMAIN}`;
    const followEmail = mailto(
      postEmail,
      'follow',
      `Follow ${post.title}`,
      'Just send this email to start following this thread',
    );
    const replyEmail = mailto(
      postEmail,
      null,
      `Re: ${post.title}`,
      'Enter your reply here.\n(please remove this text and your email signature if any)',
    );
    const actions = [
      { label: 'follow', mailto: followEmail, style: 'standard' },
      { label: 'reply', mailto: replyEmail },
    ];
    return (
      <div>
        <TopBar group={post.group} />
        <Content>
          <TitleWithActions title={post.title} actions={actions} />
          <Metadata user={post.user.name} createdAt={post.createdAt} followersCount={post.followers.total} />
          <PostBody>
            <EditableText mailto={mailto(postEmail, 'edit', post.title, post.text)}>
              <div dangerouslySetInnerHTML={{ __html: post.html }} />
            </EditableText>
          </PostBody>
          <PostReactions group={post.group} thread={post} size={24} />
          {post.replies.nodes.map((reply, i) => (
            <Reply key={i} group={post.group} thread={post} reply={reply} />
          ))}
        </Content>
        <Footer group={post.group} post={post} />
      </div>
    );
  }
}

const getDataQuery = gql`
  query Post($postSlug: String) {
    Post(postSlug: $postSlug) {
      PostId
      slug
      title
      html
      text
      createdAt
      group {
        id
        name
        slug
      }
      user {
        id
        name
      }
      followers {
        total
        nodes {
          ... on User {
            name
            image
          }
        }
      }
      replies {
        total
        nodes {
          ... on Post {
            id
            PostId
            title
            html
            text
            createdAt
            user {
              id
              name
            }
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
        postSlug: props.threadSlug,
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
          offset: data.Post.posts.nodes.length,
          limit: POSTS_PER_PAGE,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }
          previousResult.Post.posts.nodes = [...previousResult.Post.posts.nodes, fetchMoreResult.Post.posts.nodes];
          console.log('>>> updateQuery previousResult', previousResult, 'fetchMoreResult', fetchMoreResult);
          return previousResult;
        },
      });
    },
  }),
});

export default withIntl(addData(ThreadPage));
