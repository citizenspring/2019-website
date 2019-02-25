import React from 'react';
import PropTypes from 'prop-types';
import { LinksWrapper } from './Styles';
import LinkItem from './LinkItem';
import Link from '../Link';
import env from '../../env.frontend';
import settings from '../../../settings.json';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { mailto } from '../../lib/utils';

export default function FooterLinks({ group, editUrl }) {
  const groupEmail = group && `${group.slug}@${env.DOMAIN}`;
  return (
    <LinksWrapper>
      {editUrl && (
        <LinkItem icon="✏️">
          <Link href={editUrl} color="black">
            <FormattedMessage id="footer.suggestEdit" defaultMessage="suggest an edit to this page" />
          </Link>
        </LinkItem>
      )}
      {group && (
        <div>
          <LinkItem icon="✉️">
            <Link mailto={groupEmail} color="black">
              <FormattedMessage id="footer.group.sendMessage" defaultMessage="Send a message to this group" />
            </Link>
          </LinkItem>
          <LinkItem icon="📥">
            <Link
              mailto={mailto(
                groupEmail,
                'follow',
                `Follow ${group.name}`,
                'Just send this email be notified whenever a new post is published in this group',
              )}
              color="black"
            >
              <FormattedMessage id="footer.group.follow" defaultMessage="Follow this group" />
            </Link>
          </LinkItem>
        </div>
      )}

      {get(settings, 'home.buttons', []).map((button, key) => (
        <LinkItem key={key}>
          <Link href={button.url} color="black">
            {button.label}
          </Link>
        </LinkItem>
      ))}
    </LinksWrapper>
  );
}

FooterLinks.propTypes = {
  groupSlug: PropTypes.string,
  editUrl: PropTypes.string,
};
