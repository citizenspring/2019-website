import React from 'react';
import withIntl from '../lib/withIntl';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import styled from 'styled-components';
import TagsList from './TagsList';

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
    const { group, selected } = this.props;
    const posts = get(group, 'posts.nodes');
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
        <TagsList groupSlug={group.slug} tags={Object.keys(tags)} showLabel={true} selected={selected} />
      </TagsSelectorWrapper>
    );
  }
}

export default withIntl(TagsSelector);
