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

const Tags = styled.div``;

export default function TitleWithTags({ title, subtitle, tags, groupSlug }) {
  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {tags && (
        <Tags>
          <TagsList tags={tags} groupSlug={groupSlug} />
        </Tags>
      )}
    </Wrapper>
  );
}
