import React from 'react';
import PropTypes from 'prop-types';
import GoogleMap from './GoogleMap';
import colors from '../constants/colors';

import styled from 'styled-components';

const LocationWrapper = styled.div`
  margin: 1rem 0;
`;
const Map = styled.div`
  height: 300px;
`;

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
          <Map>
            <GoogleMap lat={lat} long={long} />
          </Map>
        )}
      </LocationWrapper>
    );
  }
}

export default Location;
