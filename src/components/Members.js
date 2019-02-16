import React, { Component } from 'react';
import PropTypes from '../lib/propTypes';
import styled from 'styled-components';
// import Spinner from 'react-spinkit';

import Member from '../components/Member';
import { FormattedMessage } from 'react-intl';
import { Subtitle } from '../styles/layout';

const Wrapper = styled.div`
  margin: 0px;
`;
const List = styled.div`
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
`;
const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
`;

export default class Members extends Component {
  static propTypes = {
    members: PropTypes.nodeList.isRequired,
    type: PropTypes.string, // GROUP or POST
  };
  render() {
    const { members } = this.props;

    if (members.total === 0) {
      return (
        <div>
          <FormattedMessage id="membersList.empty" defaultMessage="No member yet" />
        </div>
      );
    } else if (members.total > 0) {
      return this.renderList(members);
    } else
      return (
        <LoadingWrapper>
          <FormattedMessage id="loading" defaultMessage="loading" />
          {/* <Spinner name="ball-grid-pulse" fadeIn="none" /> */}
        </LoadingWrapper>
      );
  }

  renderList(members) {
    const { type } = this.props;
    return (
      <Wrapper>
        <Subtitle mt={0} pt={0}>
          {type === 'GROUP' && <FormattedMessage id="group.membersList.title" defaultMessage="Members" />}
          {type === 'POST' && <FormattedMessage id="post.membersList.title" defaultMessage="Followers" />}
        </Subtitle>
        <List>
          {members.nodes.map((item, i) => (
            <Member key={i} member={item} />
          ))}
        </List>
      </Wrapper>
    );
  }
}
