import React, { Component } from 'react';
import PropTypes from '../lib/propTypes';
import styled from 'styled-components';
// import Spinner from 'react-spinkit';

import Avatar from './Avatar';
import { FormattedMessage } from 'react-intl';

const MemberWrapper = styled.div`
  margin: 5px;
`;

export default class Member extends Component {
  static propTypes = {
    member: PropTypes.nodeType('User'),
  };
  render() {
    const { member } = this.props;

    return (
      <MemberWrapper>
        <Avatar user={member} />
      </MemberWrapper>
    );
  }
}
