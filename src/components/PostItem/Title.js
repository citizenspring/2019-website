import React from 'react';
import PropTypes from 'prop-types';
import Link from '../Link';
import { Title } from './Styles';
import TagsList from '../TagsList';
import { Flex } from '@rebass/grid';

export default function PostItemTitle(props) {
  return (
    <Flex flexDirection={['column', 'row', 'row']} alignItems="left" flexWrap="wrap">
      <Title>
        <Link href={props.path} color="black">
          {props.title}
        </Link>
      </Title>
      <TagsList tags={props.tags} groupSlug={props.groupSlug} date={props.date} />
    </Flex>
  );
}

PostItemTitle.propTypes = {
  title: PropTypes.string.isRequired,
};
