import React from 'react';
import PropTypes from '../../lib/propTypes';
import Moment from 'react-moment';
import withIntl from '../../lib/withIntl';

import { MetadataWrapper, FooterLink } from './Styles';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';

function EventMetadata({ startsAt, endsAt, group, location }) {
  return (
    <MetadataWrapper>
      {group && (
        <span>
          <Link href={`/${group.slug}`}>{group.name || group.slug}</Link> |{' '}
        </span>
      )}
      <span>
        📆 <Moment format="dddd D MMMM HH:mm">{new Date(Number(startsAt))}</Moment>{' '}
        <FormattedMessage id="event.metadata.till" defaultMessage="till" />{' '}
        <Moment format="HH:mm">{new Date(Number(endsAt))}</Moment>{' '}
        <FormattedMessage id="event.metadata.at" defaultMessage="at" /> {location.name}, {location.address}{' '}
        {location.zipcode} {location.city}
      </span>
    </MetadataWrapper>
  );
}

EventMetadata.propTypes = {
  startsAt: PropTypes.string.isRequired,
  endsAt: PropTypes.string.isRequired,
  group: PropTypes.nodeType('Group'),
};

export default withIntl(EventMetadata);
