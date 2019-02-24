import React from 'react';
import PropTypes from 'prop-types';
import Link from '../Link';
import { TitleWrapper, Title } from './Styles';
import TagsList from '../TagsList';

export default function PostItemTitle(props) {
  return (
    <TitleWrapper>
      <Title>
        <Link href={props.path} color="black">
          {props.title}
        </Link>
      </Title>
      <TagsList tags={props.tags} groupSlug={props.groupSlug} />
    </TitleWrapper>
  );
}

PostItemTitle.propTypes = {
  title: PropTypes.string.isRequired,
};
