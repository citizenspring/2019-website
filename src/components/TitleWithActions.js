import React from 'react';
import PropTypes from '../lib/propTypes';
import StyledLink from './StyledLink';
import styled from 'styled-components';
import Link from './Link';
import { Title, Subtitle } from '../styles/layout';

const Wrapper = styled.div`
  display: flex;
  align-items: baseline;
`;

const Actions = styled.div`
  display: flex;
`;
const Action = styled.div`
  margin: 0.5rem;
`;

export default function TitleWithActions({ title, subtitle, actions }) {
  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <Actions>
        {actions.map((action, i) => (
          <Action key={i}>
            <Link mailto={action.mailto}>
              <StyledLink buttonStyle={action.style || 'primary'} buttonSize="small">
                {action.label}
              </StyledLink>
            </Link>
          </Action>
        ))}
      </Actions>
    </Wrapper>
  );
}
