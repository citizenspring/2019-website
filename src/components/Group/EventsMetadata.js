import React from 'react';
import PropTypes from '../../lib/propTypes';
import { MetadataWrapper } from './Styles';
import { FormattedMessage } from 'react-intl';

export default function Metadata({ group }) {
  return (
    <MetadataWrapper color={group.color}>
      <FormattedMessage
        id="group.header.events"
        values={{ n: group.posts.total }}
        defaultMessage="{n} {n, plural, one {event} other {events}}"
      />{' '}
      |{' '}
      <FormattedMessage
        id="group.header.followers"
        values={{ n: group.followers.total }}
        defaultMessage="{n} {n, plural, one {follower} other {followers}}"
      />
    </MetadataWrapper>
  );
}

Metadata.propTypes = {
  group: PropTypes.nodeType('Group').isRequired,
};
