import React from 'react';
import withIntl from '../../lib/withIntl';
import GoogleMap from '../GoogleMap';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import styled from 'styled-components';

const SubgroupsMapWrapper = styled.div`
  width: 100%;
  height: 400px;
  overflow: hidden;
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

    const markers = [];
    groups.map(g => {
      if (g.location) {
        markers.push({ lat: g.location.lat, long: g.location.long, path: g.path, slug: g.slug });
      }
    });
    const location = get(this.props, 'data.Group.location', {});
    console.log('>>> markers', markers);
    console.log('>>> location', location);
    if (!location.lat && markers.length === 0) {
      return <div />;
    }
    return (
      <SubgroupsMapWrapper>
        <GoogleMap lat={location.lat} long={location.long} markers={markers} />
      </SubgroupsMapWrapper>
    );
  }
}

export default withIntl(SubgroupsMap);
