import React from 'react';
import PropTypes from '../../lib/propTypes';
import Moment from 'react-moment';
import withIntl from '../../lib/withIntl';

import { MetadataWrapper, FooterLink } from './Styles';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';

function Metadata({ repliesCount, followersCount, createdAt, user, group }) {
  const timestamp = new Date(Number(createdAt));
  return (
    <MetadataWrapper>
      {group && (
        <span>
          <Link href={`/${group.slug}`}>{group.name || group.slug}</Link> |{' '}
        </span>
      )}
      <span>
        <FormattedMessage id="post.metadata.started" defaultMessage="Started" /> <Moment fromNow>{timestamp}</Moment>{' '}
        <FormattedMessage id="post.metadata.by" defaultMessage="by" />
      </span>
      <span>
        <FooterLink>{user}</FooterLink>
      </span>
      {repliesCount > 0 && (
        <span>
          {' '}
          |{' '}
          <FormattedMessage
            id="post.metadata.repliesCount"
            values={{ n: repliesCount }}
            defaultMessage="{n, plural, zero {} one {one reply} other {# replies}}"
          />
        </span>
      )}
      {followersCount > 0 && (
        <span>
          {' '}
          |{' '}
          <FormattedMessage
            id="post.metadata.followersCount"
            values={{ n: followersCount }}
            defaultMessage="{n, plural, zero {} one {one follower} other {# followers}}"
          />
        </span>
      )}
    </MetadataWrapper>
  );
}

Metadata.propTypes = {
  user: PropTypes.string.isRequired,
  repliesCount: PropTypes.number,
  followersCount: PropTypes.number,
  createdAt: PropTypes.string.isRequired,
  group: PropTypes.nodeType('Group'),
};

export default withIntl(Metadata);
