import React from 'react';
import PropTypes from 'prop-types';
import { Gmaps, Marker } from 'react-gmaps';
import env from '../env.frontend';

class Map extends React.Component {
  static propTypes = {
    lat: PropTypes.number,
    long: PropTypes.number,
    address: PropTypes.string,
    markers: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  onMapCreated(map) {
    map.setOptions({
      disableDefaultUI: false,
    });
  }

  handleClick(m) {
    console.log('>>> click on', m);
  }

  render() {
    let { lat, long, markers } = this.props;
    if (!markers || markers.length === 0) {
      markers = [{ lat, long }];
    }
    if (!lat && !long) {
      lat = markers[0].lat;
      long = markers[0].long;
    }
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Gmaps
          width={'100%'}
          height={'100%'}
          lat={lat}
          lng={long}
          zoom={14}
          loadingMessage={'Loading map'}
          params={{
            v: '3.exp',
            key: env.GOOGLE_MAPS_API_KEY,
          }}
          onMapCreated={this.onMapCreated}
        >
          {markers.map((m, key) => (
            <Marker key={key} lat={m.lat} lng={m.long} draggable={false} onClick={() => this.handleClick(m)} />
          ))}
        </Gmaps>
        <a
          className="map-overlay"
          href={`http://maps.apple.com/?q=${lat},${long}`}
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    );
  }
}

export default Map;
