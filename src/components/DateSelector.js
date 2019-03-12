import React from 'react';
import withIntl from '../lib/withIntl';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import styled from 'styled-components';
import PropTypes from '../lib/propTypes';
import { Router } from '../server/pages';
import { Flex } from '@rebass/grid';

const Date = styled.a`
  display: inline-block;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  font-size: 10px;
  text-align: center;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-right: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 4px;
  padding: 2px 4px;
  cursor: pointer;
  color: ${props => (props.selected ? '#FF0044' : '#1f87ff')};
  background: ${props => (props.selected ? '#FFF0F0' : '#e0f1ff')};
`;

const List = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Label = styled.div`
  color: #666;
  margin-right: 0.5rem;
  font-size: 12px;
  text-transform: uppercase;
`;

class DateSelector extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(date) {
    const { groupSlug, tag } = this.props;
    if (date === this.props.selected) {
      date = null;
    }
    Router.pushRoute('group', { groupSlug, tag, date });
  }

  render() {
    const { selected } = this.props;

    const startsAtOptions = [
      { label: 'Thu March 21st', value: '2019-03-21' },
      { label: 'Fri March 22nd', value: '2019-03-22' },
      { label: 'Sat March 23rd', value: '2019-03-23' },
      { label: 'Sun March 24th', value: '2019-03-24' },
    ];

    return (
      <Flex flexDirection="column">
        <Label>
          <FormattedMessage id="date.filter.label" defaultMessage="Filter by date" />:
        </Label>
        <List>
          {startsAtOptions.map(date => (
            <Date selected={date.value === selected} onClick={() => this.onClick(date.value)}>
              {date.label}
            </Date>
          ))}
        </List>
      </Flex>
    );
  }
}

export default withIntl(DateSelector);
