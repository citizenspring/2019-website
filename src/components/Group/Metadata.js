import React from 'react';
import PropTypes from '../../lib/propTypes';
import { MetadataWrapper } from './Styles';
import { FormattedMessage } from 'react-intl';

export default function Metadata({ group }) {
  return (
    <MetadataWrapper color={group.color}>
      <FormattedMessage
        id="group.header.members"
        values={{ n: group.followers.total }}
        defaultMessage="{n} {n, plural, one {member} other {members}}"
      />{' '}
      |{' '}
      <FormattedMessage
        id="group.header.posts"
        values={{ n: group.posts.total }}
        defaultMessage="{n} {n, plural, one {post} other {posts}}"
      />
    </MetadataWrapper>
  );
}

Metadata.propTypes = {
  group: PropTypes.nodeType('Group').isRequired,
};
