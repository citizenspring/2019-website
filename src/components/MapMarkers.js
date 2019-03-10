import React from 'react';
import withIntl from '../lib/withIntl';
import GoogleMap from './Map/GoogleMap';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import styled from 'styled-components';

const MapMarkersWrapper = styled.div`
  width: 100%;
  height: 400px;
  overflow: hidden;
`;

class MapMarkers extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { group } = this.props;
    const posts = get(group, 'posts.nodes');
    if (!posts) {
      return <div />;
    }

    const markers = [];
    let i = 0;
    posts.map(p => {
      if (p.location) {
        markers.push({
          index: i++,
          lat: p.location.lat,
          lng: p.location.long,
          event: p,
          href: `/${group.slug}/events/${p.slug}`,
        });
      }
    });
    const location = get(group, 'location', {});
    if (!location.lat && markers.length === 0) {
      return <div />;
    }
    return (
      <MapMarkersWrapper>
        <GoogleMap lat={location.lat} lng={location.long} markers={markers} zoom={12} markerSize={'28px'} />
      </MapMarkersWrapper>
    );
  }
}

export default withIntl(MapMarkers);
