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
  position: absolute;
  left: -18px;
  top: -28px;
`;

const BalloonWrapper = styled.div`
  position: absolute;
  top: -80px;
  min-height: 70px;
  width: 200px;
  padding: 0.5rem;
  background: white;
  border: 1px solid #555;
  border-radius: 4px;
  z-index: 20;
`;

const Balloon = ({ marker }) =>
  marker.event ? (
    <BalloonWrapper>
      <Title>{marker.event.title}</Title>
      <EventMetadata startsAt={marker.event.startsAt} endsAt={marker.event.endsAt} location={marker.event.location} />
    </BalloonWrapper>
  ) : (
    <div />
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
