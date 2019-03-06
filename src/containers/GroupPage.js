import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../lib/withIntl';
import PostList from './PostList';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

import { Box, Flex } from '@rebass/grid';
import { Title, Content, DescriptionBlock } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import Loading from './Loading';
import GroupNotFound from './GroupNotFound';
import EventsGroupPage from './EventsGroupPage';
import RichText from '../components/RichText';
import Members from '../components/Members';
import { mailto } from '../lib/utils';

import env from '../env.frontend';
import { FormattedMessage } from 'react-intl';
import Metadata from '../components/Group/Metadata';
import TagsSelector from '../components/TagsSelectorWithData';

import { get } from 'lodash';

class GroupPage extends React.Component {
  static propTypes = {
    groupSlug: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
    selectedTag: PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      data: { loading, Group: group },
      groupSlug,
      selectedTag,
    } = this.props;
    const groupEmail = `${groupSlug}@${env.DOMAIN}`;
    if (loading) return <Loading groupSlug={groupSlug} />;
    if (!group) return <GroupNotFound groupSlug={groupSlug} />;

    const template = get(group, 'settings.template');

    if (template === 'events') {
      return <EventsGroupPage group={group} tag={selectedTag} />;
    }

    const actions = [
      {
        label: 'join',
        href: mailto(
          groupEmail,
          'join',
          `Join ${group.name}`,
          'Just send this email to join the group and be notified whenever there is a new post.',
        ),
        style: 'standard',
      },
      { label: 'new message', href: mailto(groupEmail) },
    ];

    return (
      <div>
        <TopBar group={group} />
        <Content>
          <TitleWithActions title={group.name} actions={actions} />
          <Metadata group={group} editUrl={mailto(groupEmail, 'edit', group.name, group.description)} />
          <Flex flexDirection={['column', 'row', 'row']}>
            <Box width={1} mr={[0, 3, 4]}>
              <DescriptionBlock>
                <RichText html={group.description}>
                  {!group.description && (
                    <FormattedMessage id="group.description.empty" defaultMessage="no group description" />
                  )}
                </RichText>
              </DescriptionBlock>
              <TagsSelector groupSlug={group.slug} selected={selectedTag} />
              <PostList groupSlug={group.slug} posts={group.posts} />
            </Box>
            <Box width={300} mt={[4, 1, 1]}>
              <Members type="GROUP" members={group.followers} />
            </Box>
          </Flex>
        </Content>
        <Footer group={group} />
      </div>
    );
  }
}

const getDataQuery = gql`
  query Group($groupSlug: String!, $tags: [String]) {
    Group(groupSlug: $groupSlug) {
      id
      slug
      name
      description
      settings
      followers {
        total
        nodes {
          ... on User {
            id
            name
            image
          }
        }
      }
      posts(tags: $tags) {
        total
        nodes {
          id
          ... on Post {
            PostId
            title
            slug
            type
            createdAt
            startsAt
            endsAt
            user {
              id
              name
              image
            }
            tags
            followers {
              total
            }
            replies {
              total
            }
            location {
              name
              address
              zipcode
              city
              lat
              long
            }
          }
        }
      }
      location {
        name
        zipcode
        lat
        long
      }
    }
  }
`;

const POSTS_PER_PAGE = 20;

export const addData = graphql(getDataQuery, {
  options(props) {
    return {
      variables: {
        groupSlug: props.groupSlug,
        offset: 0,
        limit: props.limit || POSTS_PER_PAGE * 2,
        tags: props.selectedTag && [props.selectedTag],
      },
    };
  },
  props: ({ data }) => ({
    data,
    fetchMore: () => {
      return data.fetchMore({
        variables: {
          offset: data.Group.posts.nodes.length,
          limit: POSTS_PER_PAGE,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }
          previousResult.Group.posts.nodes = [...previousResult.Group.posts.nodes, fetchMoreResult.Group.posts.nodes];
          console.log('>>> updateQuery previousResult', previousResult, 'fetchMoreResult', fetchMoreResult);
          return previousResult;
        },
      });
    },
  }),
});

export default withIntl(addData(GroupPage));
