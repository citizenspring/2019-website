import React from 'react';
import PropTypes from 'prop-types';
import GoogleMap from './Map/GoogleMap';
import colors from '../constants/colors';

import styled from 'styled-components';

const LocationWrapper = styled.div`
  margin: 1rem 0;
  overflow: hidden;
  height: 100%;
`;
const MapWrapper = styled.div``;

class Location extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    showTitle: PropTypes.bool,
  };

  static defaultProps = {
    showTitle: true,
  };

  render() {
    const { name, address, lat, long } = this.props.location;

    return (
      <LocationWrapper>
        <div className="description">
          {this.props.showTitle && <h1>Location</h1>}
          {this.props.showLocationName && <div className="name">{name}</div>}
          <div className="address" style={{ color: colors.darkgray }}>
            <a href={`http://maps.apple.com/?q=${lat},${long}`} target="_blank" rel="noopener noreferrer">
              {address}
            </a>
          </div>
        </div>
        {lat && long && (
          <MapWrapper>
            <GoogleMap lat={lat} lng={long} zoom={15} />
          </MapWrapper>
        )}
      </LocationWrapper>
    );
  }
}

export default Location;
