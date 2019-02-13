import React from 'react';
import withIntl from '../../lib/withIntl';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import styled from 'styled-components';

const SubgroupsTags = styled.div`
  display: flex;
  width: 100%;
  margin: 1rem 0;
`;

const Tag = styled.div`
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  font-size: 10px;
  text-align: center;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-right: 0.3rem;
  border-radius: 4px;
  padding: 2px 4px;
  color: ${props => (props.selected ? '#FF0044' : '#1f87ff')};
  background: ${props => (props.selected ? '#FFF0F0' : '#e0f1ff')};
`;

const TagsList = styled.div`
  display: flex;
`;

const Label = styled.div`
  color: #666;
  margin-right: 0.5rem;
`;

class SubgroupsMap extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { group } = this.props;
    const groups = get(this.props, 'group.groups.nodes');
    if (!groups) {
      return <div />;
    }
    console.log('>>> groups', groups);

    const tags = {};
    groups.map(g => {
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
    tagsArray[0].selected = true;
    console.log('>>> tags', tags, tagsArray);
    return (
      <SubgroupsTags>
        <Label>Filter by tag:</Label>
        <TagsList>
          {tagsArray.map((tag, key) => (
            <Tag key={key} selected={tag.selected}>
              {tag.label}
            </Tag>
          ))}
        </TagsList>
      </SubgroupsTags>
    );
  }
}

export default withIntl(SubgroupsMap);
