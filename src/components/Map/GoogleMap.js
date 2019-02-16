import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import GoogleMapReact from 'google-map-react';
import { Router } from '../../server/pages';

import controllable from 'react-controllables';
import shouldPureComponentUpdate from 'react-pure-render/function';

import Marker from './Marker';

const K_SCALE_NORMAL = 0.65;
const K_MARGIN_TOP = 30;
const K_MARGIN_RIGHT = 30;
const K_MARGIN_BOTTOM = 30;
const K_MARGIN_LEFT = 30;

const K_HOVER_DISTANCE = 30;

import { getEnvVar, loadScriptAsync } from '../../lib/utils';

const getGoogleMapsScriptUrl = () => {
  const apiKey = getEnvVar('GOOGLE_MAPS_API_KEY');
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
};

@controllable(['center', 'zoom', 'markers'])
class GoogleMap extends Component {
  static propTypes = {
    lat: PropTypes.number,
    lng: PropTypes.number,
    zoom: PropTypes.number,
    markerSize: PropTypes.number,
    markers: PropTypes.arrayOf(PropTypes.object),
    onCenterChange: PropTypes.func, // @controllable generated fn
    onZoomChange: PropTypes.func, // @controllable generated fn
    onChange: PropTypes.func,
    onMarkerHover: PropTypes.func,
    onChildClick: PropTypes.func,
    zoom: PropTypes.number,
    visibleRowFirst: PropTypes.number,
    visibleRowLast: PropTypes.number,
    maxVisibleRows: PropTypes.number,
    hoveredRowIndex: PropTypes.number,
    openBalloonIndex: PropTypes.number,
  };

  static defaultProps = {
    lat: 50.8450035,
    lng: 4.35811769999998,
    zoom: 14,
    markers: [],
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {};
  }

  shouldComponentUpdate = shouldPureComponentUpdate;

  _onChange = (center, zoom, bounds, marginBounds) => {
    if (this.props.onChange) {
      this.props.onChange({ center, zoom, bounds, marginBounds });
    } else {
      this.props.onCenterChange(center);
      this.props.onZoomChange(zoom);
    }
  };

  _onChildClick = (index, childProps) => {
    const marker = this.props.markers[index];
    console.log('>>> click on', marker);
    if (this.props.onChildClick) {
      this.props.onChildClick(marker);
    }
  };

  _onChildMouseEnter = (index, childProps) => {
    const marker = this.props.markers[index];
    this.setState({ openBalloonIndex: Number(index) });
    console.log('>>> onMarkerHover', marker);
    if (this.props.onMarkerHover) {
      this.props.onMarkerHover(index);
    }
  };

  _onChildMouseLeave = (/* key, childProps */) => {
    this.setState({ openBalloonIndex: null });
    if (this.props.onMarkerHover) {
      this.props.onMarkerHover(-1);
    }
  };

  _onBalloonCloseClick = () => {
    if (this.props.onChildClick) {
      this.props.onChildClick(-1);
    }
  };

  handleClick(marker) {
    Router.pushRoute('thread', marker);
  }

  render() {
    const { markers, lat, lng, zoom, markerSize } = this.props;
    const center = { lat: lat || GoogleMap.defaultProps.lat, lng: lng || GoogleMap.defaultProps.lng };
    if (markers.length === 0) {
      markers.push({
        lat,
        lng,
      });
    }
    const GOOGLE_MAPS_API_KEY = getGoogleMapsScriptUrl();

    const Markers = markers.map((marker, index) => (
      <Marker
        // required props
        key={index}
        lat={marker.lat}
        lng={marker.lng}
        markerSize={markerSize}
        title={marker.text}
        // any user props
        showBalloon={index === this.state.openBalloonIndex}
        marker={marker}
      >
        🌱
      </Marker>
    ));

    return (
      // Important! Always set the container height explicitly
      <div height={400} width={600} style={{ height: '400px' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
          defaultCenter={center}
          defaultZoom={zoom}
          onChange={this._onChange}
          onChildClick={this._onChildClick}
          onChildMouseEnter={this._onChildMouseEnter}
          onChildMouseLeave={this._onChildMouseLeave}
        >
          {Markers}
        </GoogleMapReact>
      </div>
    );
  }
}

export default GoogleMap;
