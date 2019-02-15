import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../lib/withIntl';
import Locations from './Locations';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const LocationsWrapper = styled.div`
  width: 100%;
  height: 400px;
`;

class LocationsWithData extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.data.loading) {
      return <FormattedMessage id="loading" defaultMessage="loading" />;
    }
    return <Locations group={this.props.data.Group} />;
  }
}

const getDataQuery = gql`
  query Locations($groupSlug: String!, $type: String, $limit: Int, $offset: Int, $hasLocation: Boolean) {
    Group(groupSlug: $groupSlug) {
      location {
        name
        zipcode
        lat
        long
      }
      groups(type: $type, limit: $limit, offset: $offset, hasLocation: $hasLocation) {
        total
        nodes {
          id
          ... on Group {
            GroupId
            name
            createdAt
            slug
            location {
              name
              zipcode
              lat
              long
            }
            parentGroup {
              slug
              name
              description
            }
          }
        }
      }
    }
  }
`;

const GROUPS_PER_PAGE = 20;

export const addData = graphql(getDataQuery, {
  options(props) {
    return {
      variables: {
        groupSlug: props.groupSlug || 'citizenspring',
        hasLocation: true,
        offset: 0,
        limit: props.limit || GROUPS_PER_PAGE * 2,
      },
    };
  },
  props: ({ data }) => ({
    data,
    fetchMore: () => {
      return data.fetchMore({
        variables: {
          offset: data.allGroups.nodes.length,
          limit: GROUPS_PER_PAGE,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }
          previousResult.allGroups.nodes = [...previousResult.allGroups.nodes, fetchMoreResult.allGroups.nodes];
          console.log('>>> updateQuery previousResult', previousResult, 'fetchMoreResult', fetchMoreResult);
          return previousResult;
        },
      });
    },
  }),
});

export default withIntl(addData(LocationsWithData));
