import React from 'react';
import withIntl from '../lib/withIntl';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import styled from 'styled-components';
import PropTypes from '../lib/propTypes';
import { Router } from '../server/pages';

const TagsListWrapper = styled.div`
  display: flex;
  width: 100%;
  margin: 1rem 0;
`;

const Tag = styled.a`
  display: inline-block;
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
  cursor: pointer;
  color: ${props => (props.selected ? '#FF0044' : '#1f87ff')};
  background: ${props => (props.selected ? '#FFF0F0' : '#e0f1ff')};
`;

const List = styled.div`
  display: flex;
`;

const Label = styled.div`
  color: #666;
  margin-right: 0.5rem;
`;

class TagsList extends React.Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string),
    selected: PropTypes.string,
    showLabel: PropTypes.boolean,
  };
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(tag) {
    Router.pushRoute('group', { groupSlug: this.props.groupSlug, tag });
  }

  render() {
    const { showLabel, tags, selected } = this.props;
    return (
      <TagsListWrapper>
        {showLabel && <Label>Filter by tag:</Label>}
        <List>
          {(tags || []).map((tag, key) => (
            <Tag key={key} selected={tag === selected} onClick={() => this.onClick(tag)}>
              {tag}
            </Tag>
          ))}
        </List>
      </TagsListWrapper>
    );
  }
}

export default withIntl(TagsList);
