import React from 'react';
import Router from '../server/pages';
import PropTypes from '../lib/propTypes';
import styled from 'styled-components';
import colors from '../constants/colors';

const StyledA = styled.a`
  color: ${props => props.color || colors.blue};
  text-decoration: none;
  cursor: pointer;
`;

export default function Link({ href, mailto, color, children, className }) {
  if (mailto) {
    return (
      <StyledA color={color} href={`mailto:${mailto}`} className={className}>
        {children}
      </StyledA>
    );
  }
  if (href.match(/^https?:\/\//i) || href.match(/^mailto:/)) {
    return (
      <StyledA color={color} href={href} className={className}>
        {children}
      </StyledA>
    );
  }
  return (
    <Router.Link route={href} className={className}>
      <StyledA color={color}>{children}</StyledA>
    </Router.Link>
  );
}

Link.propTypes = {
  href: PropTypes.string,
  mailto: PropTypes.email,
};
