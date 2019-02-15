import React from 'react';
import PropTypes from '../../lib/propTypes';
import controllable from 'react-controllables';

import styled from 'styled-components';
import EventMetadata from '../PostItem/EventMetadata';
import StyledLink from '../StyledLink';

const Title = styled.h1`
  font-size: 14px;
`;

const MarkerWrapper = styled.div`
  position: relative;
`;

const BalloonWrapper = styled.div`
  position: absolute;
  top: -80px;
  height: 70px;
  width: 200px;
  padding: 0.5rem;
  background: white;
  border: 1px solid #555;
  border-radius: 4px;
`;

const Balloon = ({ marker }) => (
  <BalloonWrapper>
    <Title>{marker.event.title}</Title>
    <EventMetadata startsAt={marker.event.startsAt} endsAt={marker.event.endsAt} location={marker.event.location} />
  </BalloonWrapper>
);

@controllable(['hoverState', 'showBalloon'])
export default class Marker extends React.Component {
  static propTypes = {
    showBalloon: PropTypes.bool,
    markerSize: PropTypes.number,
    marker: PropTypes.object,
    hoverState: PropTypes.bool.isRequired,
    onHoverStateChange: PropTypes.func.isRequired,
  };

  render() {
    console.log('>>> Marker props', this.props);
    return (
      <MarkerWrapper>
        {this.props.showBalloon && <Balloon marker={this.props.marker} />}
        <StyledLink fontSize={this.props.markerSize} href={this.props.marker.href}>
          🌱
        </StyledLink>
      </MarkerWrapper>
    );
  }
}
