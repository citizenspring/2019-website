import React from 'react';
import PropTypes from '../../lib/propTypes';
import { MetadataWrapper } from './Styles';
import { MetadataItem } from '../../styles/layout';
import { FormattedMessage } from 'react-intl';
import Link from '../Link';

export default function Metadata({ group, editUrl }) {
  return (
    <MetadataWrapper color={group.color}>
      <MetadataItem>
        <FormattedMessage
          id="group.header.events"
          values={{ n: group.posts.total }}
          defaultMessage="{n} {n, plural, one {event} other {events}}"
        />
      </MetadataItem>
      <MetadataItem>
        |{' '}
        <FormattedMessage
          id="group.header.followers"
          values={{ n: group.followers.total }}
          defaultMessage="{n} {n, plural, one {follower} other {followers}}"
        />
      </MetadataItem>
      {editUrl && (
        <MetadataItem className="edit">
          |{' '}
          <Link href={editUrl}>
            ✏️
            <FormattedMessage id="edit" defaultMessage="edit" />
          </Link>
        </MetadataItem>
      )}
    </MetadataWrapper>
  );
}

Metadata.propTypes = {
  group: PropTypes.nodeType('Group').isRequired,
};
