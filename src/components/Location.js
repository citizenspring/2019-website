import React from 'react';
import PropTypes from 'prop-types';
import Map from './Map';
import colors from '../constants/colors';

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
      <section id="location" className="location">
        <div className="description">
          {this.props.showTitle && <h1>Location</h1>}
          <div className="name">{name}</div>
          <div className="address" style={{ color: colors.darkgray }}>
            <a href={`http://maps.apple.com/?q=${lat},${long}`} target="_blank" rel="noopener noreferrer">
              {address}
            </a>
          </div>
        </div>
        {lat && long && (
          <div className="map">
            <Map lat={lat} long={long} />
          </div>
        )}
      </section>
    );
  }
}

export default Location;
