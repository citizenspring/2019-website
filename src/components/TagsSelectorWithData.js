import React from 'react';
import withIntl from '../lib/withIntl';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import styled from 'styled-components';
import TagsList from './TagsList';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const TagsSelectorWrapper = styled.div`
  display: flex;
  width: 100%;
  margin: 1rem 0;
`;

class TagsSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data, selected, groupSlug } = this.props;
    console.log('>>> data', data);
    const posts = get(data, 'allPosts.nodes');
    if (!posts) {
      return <div />;
    }

    const tags = {};
    posts.map(g => {
      if (g.tags) {
        g.tags.map(tag => {
          tags[tag] = tags[tag] || 0;
          tags[tag]++;
        });
      }
    });
    const tagsArray = [];
    Object.keys(tags).map(tag => {
      tagsArray.push({
        label: tag,
        weight: tags[tag],
      });
    });
    if (tagsArray.length === 0) {
      return <div />;
    }
    tagsArray[0].selected = true;
    console.log('>>> tags:', tags, 'tagsArray:', tagsArray);
    return (
      <TagsSelectorWrapper>
        <TagsList groupSlug={groupSlug} tags={Object.keys(tags)} showLabel={true} selected={selected} />
      </TagsSelectorWrapper>
    );
  }
}

const getDataQuery = gql`
  query allPosts($groupSlug: String, $onlyPostsWithLocation: Boolean) {
    allPosts(groupSlug: $groupSlug, hasLocation: $onlyPostsWithLocation) {
      total
      nodes {
        id
        ... on Post {
          tags
        }
      }
    }
  }
`;

export const addData = graphql(getDataQuery, {
  options(props) {
    return {
      variables: {
        groupSlug: props.groupSlug,
        onlyPostsWithLocation: true,
      },
    };
  },
});

export default withIntl(addData(TagsSelector));
