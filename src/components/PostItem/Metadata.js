import React from 'react';
import PropTypes from '../../lib/propTypes';
import Moment from 'react-moment';
import withIntl from '../../lib/withIntl';

import { MetadataWrapper, FooterLink } from './Styles';
import { Emoji, MetadataItem } from '../../styles/layout';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';

function Metadata({ repliesCount, followersCount, createdAt, user, group, editUrl }) {
  const timestamp = new Date(Number(createdAt));
  return (
    <MetadataWrapper>
      {group && (
        <MetadataItem>
          <Link href={`/${group.slug}`}>{group.name || group.slug}</Link> |{' '}
        </MetadataItem>
      )}
      <MetadataItem>
        <Emoji>📝</Emoji> <FormattedMessage id="post.metadata.started" defaultMessage="Started" />{' '}
        <Moment fromNow>{timestamp}</Moment> <FormattedMessage id="post.metadata.by" defaultMessage="by" />
        <FooterLink>{user}</FooterLink>
      </MetadataItem>
      {repliesCount > 0 && (
        <MetadataItem>
          |{' '}
          <FormattedMessage
            id="post.metadata.repliesCount"
            values={{ n: repliesCount }}
            defaultMessage="{n, plural, zero {} one {one reply} other {# replies}}"
          />
        </MetadataItem>
      )}
      {followersCount > 0 && (
        <MetadataItem>
          {' '}
          |{' '}
          <FormattedMessage
            id="post.metadata.followersCount"
            values={{ n: followersCount }}
            defaultMessage="{n, plural, zero {} one {one follower} other {# followers}}"
          />
        </MetadataItem>
      )}
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
  user: PropTypes.string.isRequired,
  repliesCount: PropTypes.number,
  followersCount: PropTypes.number,
  createdAt: PropTypes.string.isRequired,
  group: PropTypes.nodeType('Group'),
};

export default withIntl(Metadata);
