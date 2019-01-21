import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../lib/withIntl';
import PostList from './PostList';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

import { Content, Description } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import EditableText from '../components/EditableText';
import { mailto } from '../lib/utils';

import env from '../env.frontend';
import { FormattedMessage } from 'react-intl';

class GroupPage extends React.Component {
  static propTypes = {
    groupSlug: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const group = this.props.data.Group;
    if (!group) return <div>Loading</div>;

    const actions = [
      {
        label: 'join',
        mailto: mailto(
          group.slug,
          'join',
          `Join ${group.name}`,
          'Please present yourself to the group in a few words.',
        ),
        style: 'standard',
      },
      { label: '+ New Thread', mailto: mailto(group.slug) },
    ];

    return (
      <div>
        <TopBar group={group} />
        <Content>
          <TitleWithActions title={group.name} actions={actions} />
          <Description>
            <EditableText mailto={mailto(group.slug, 'edit', group.name, group.description)}>
              {group.description || (
                <FormattedMessage id="group.description.empty" defaultMessage="no group description" />
              )}
            </EditableText>
          </Description>
          <PostList groupSlug={group.slug} posts={group.posts} />
        </Content>
        <Footer group={group} />
      </div>
    );
  }
}

const getDataQuery = gql`
  query Group($groupSlug: String!) {
    Group(groupSlug: $groupSlug) {
      id
      slug
      name
      description
      posts {
        total
        nodes {
          id
          ... on Post {
            PostId
            title
            slug
            createdAt
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
