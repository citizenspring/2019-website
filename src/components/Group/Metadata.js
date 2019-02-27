import React from 'react';
import PropTypes from '../../lib/propTypes';
import { MetadataWrapper, MetadataItem } from './Styles';
import { FormattedMessage } from 'react-intl';

export default function Metadata({ group }) {
  return (
    <MetadataWrapper color={group.color}>
      <MetadataItem>
        <FormattedMessage
          id="group.header.members"
          values={{ n: group.followers.total }}
          defaultMessage="{n} {n, plural, one {member} other {members}}"
        />{' '}
        |{' '}
      </MetadataItem>
      <MetadataItem>
        <FormattedMessage
          id="group.header.posts"
          values={{ n: group.posts.total }}
          defaultMessage="{n} {n, plural, one {post} other {posts}}"
        />
      </MetadataItem>
    </MetadataWrapper>
  );
}

Metadata.propTypes = {
  group: PropTypes.nodeType('Group').isRequired,
};
