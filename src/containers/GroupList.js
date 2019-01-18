import React, { Component } from 'react';
import PropTypes from '../lib/propTypes';
import styled from 'styled-components';
// import Spinner from 'react-spinkit';
import GroupBox from '../components/Groups/GroupBox';
import Link from '../components/Link';
import { get } from 'lodash';

const ListWrapper = styled.div`
  margin-left: -1rem;
  display: flex;
  flex-wrap: wrap;
`;

const GroupBoxWrapper = styled.div`
  margin: 1rem;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
`;

export default class PostList extends Component {
  static propTypes = {
    groups: PropTypes.nodeList.isRequired,
  };

  render() {
    const { groups } = this.props;
    const visibleGroups = groups.nodes.filter(g => !get(g, 'settings.hidden', false));
    const errorMessage = visibleGroups.length === 0 ? 'No group' : 'Loading';
    if (visibleGroups.length > 0) {
      return this.renderList(visibleGroups);
    } else return <LoadingWrapper>{errorMessage}</LoadingWrapper>;
  }

  renderList(groups) {
    return (
      <ListWrapper>
        {groups.map((group, i) => (
          <GroupBoxWrapper key={i}>
            <Link href={`/${group.slug}`}>
              <GroupBox group={group} />
            </Link>
          </GroupBoxWrapper>
        ))}
      </ListWrapper>
    );
  }
}
