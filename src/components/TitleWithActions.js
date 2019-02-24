import React from 'react';
import PropTypes from '../lib/propTypes';
import StyledLink from './StyledLink';
import styled from 'styled-components';
import Link from './Link';
import { Title, Subtitle } from '../styles/layout';
import TagsList from './TagsList';
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

export default function TitleWithActions({ title, subtitle, actions, tags, groupSlug }) {
  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {tags && <TagsList tags={tags} groupSlug={groupSlug} />}
      <Actions>
        {actions &&
          actions.map((action, i) => (
            <Action key={i}>
              <Link href={action.href}>
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
