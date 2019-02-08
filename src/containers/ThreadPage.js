import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../lib/withIntl';
import Metadata from '../components/PostItem/Metadata';
import Post from '../components/Post/Post';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { Content } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import env from '../env.frontend';
import { mailto } from '../lib/utils';
import { capitalize } from '../server/lib/utils';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Box } from '@rebass/grid';

class ThreadPage extends React.Component {
  static propTypes = {
    threadSlug: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.messages = defineMessages({
      follow: { id: 'thread.follow.btn', defaultMessage: 'follow' },
      'follow.body': {
        id: 'thread.follow.email.body',
        defaultMessage: 'Just send this email to start following this thread',
      },
      reply: { id: 'thread.reply.btn', defaultMessage: 'reply' },
      'reply.body': {
        id: 'thread.reply.email.body',
        defaultMessage: 'Enter your reply here.\n(please remove this text and your email signature if any)',
      },
    });
  }

  render() {
    const thread = this.props.data.Post;
    if (!thread) {
      return (
        <div>
          <FormattedMessage id="loading" defaultMessage="loading" />
        </div>
      );
    }
    const { intl } = this.props;
    const threadEmail = `${thread.group.slug}/${thread.PostId}@${env.DOMAIN}`;
    const followEmail = mailto(
      threadEmail,
      'follow',
      `${capitalize(intl.formatMessage(this.messages['follow']))} ${thread.title}`,
      intl.formatMessage(this.messages['follow.body']),
    );
    const actions = [{ label: intl.formatMessage(this.messages['follow']), href: followEmail, style: 'standard' }];
    return (
      <div>
        <TopBar group={thread.group} />
        <Content>
          <TitleWithActions title={thread.title} actions={actions} />
          <Box mt={[-2, -2, -3]}>
            <Metadata user={thread.user.name} createdAt={thread.createdAt} followersCount={thread.followers.total} />
          </Box>
          <Post group={thread.group} thread={thread} post={thread} />
          {thread.replies.nodes.map((post, i) => (
            <Post key={i} group={thread.group} thread={thread} post={post} />
          ))}
        </Content>
        <Footer group={thread.group} post={thread} />
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
