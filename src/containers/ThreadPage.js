import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../lib/withIntl';
import Metadata from '../components/PostItem/Metadata';
import EventMetadata from '../components/PostItem/EventMetadata';
import Post from '../components/Post/Post';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { Content } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import TagsList from '../components/TagsList';
import env from '../env.frontend';
import { mailto } from '../lib/utils';
import { capitalize } from '../server/lib/utils';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Flex, Box } from '@rebass/grid';
import GoogleMap from '../components/Map/GoogleMap';
import FormData from '../components/FormData';
import Members from '../components/Members';

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
      interested: { id: 'event.interested.btn', defaultMessage: "I'm interested" },
      'interested.body': {
        id: 'event.interested.email.body',
        defaultMessage:
          'Just send this email to show your interest and stay posted as more information come in about this event',
      },
      post: { id: 'event.post.btn', defaultMessage: 'post a message' },
      'post.body': {
        id: 'event.post.email.body',
        defaultMessage: 'Post a message about this event.',
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
    const interestedEmail = mailto(
      threadEmail,
      'follow',
      `${capitalize(intl.formatMessage(this.messages['interested']))} ${thread.title}`,
      intl.formatMessage(this.messages['interested.body']),
    );
    const actions = [];
    if (thread.type === 'EVENT') {
      actions.push({
        label: intl.formatMessage(this.messages['interested']),
        href: interestedEmail,
        style: 'standard',
      });
    } else {
      actions.push({ label: intl.formatMessage(this.messages['follow']), href: followEmail, style: 'standard' });
    }
    return (
      <div>
        <TopBar group={thread.group} />
        <Content>
          <TitleWithActions title={thread.title} actions={actions} />
          <Box mt={[-2, -2, -3]}>
            {thread.type === 'POST' && (
              <Metadata user={thread.user.name} createdAt={thread.createdAt} followersCount={thread.followers.total} />
            )}
            {thread.type === 'EVENT' && (
              <EventMetadata startsAt={thread.startsAt} endsAt={thread.endsAt} location={thread.location} />
            )}
            <TagsList tags={thread.tags} groupSlug={thread.group.slug} />
          </Box>
          <Flex flexDirection={['column', 'row', 'row']}>
            <Box width={1} mr={[0, 3, 4]}>
              <Post group={thread.group} thread={thread} post={thread} />
              {thread.replies.nodes.map((post, i) => (
                <Post key={i} group={thread.group} thread={thread} post={post} />
              ))}
              {thread.type === 'EVENT' && (
                <div>
                  <GoogleMap lat={thread.location.lat} lng={thread.location.long} zoom={16} markerSize={'34px'} />
                  <Box width={[1, null, 1 / 2]} mt={4}>
                    <FormData data={thread.formData} />
                  </Box>
                </div>
              )}
            </Box>
            <Box width={300} mt={[4, 1, 1]}>
              <Members type={thread.type} members={thread.followers} />
            </Box>
          </Flex>
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
      type
      slug
      title
      html
      text
      tags
      formData
      createdAt
      startsAt
      endsAt
      group {
        id
        name
        slug
      }
      user {
        id
        name
        image
      }
      location {
        name
        address
        lat
        long
        zipcode
        city
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
              image
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
