import React from 'react';
import PropTypes from 'prop-types';
import Link from '../Link';
import StyledLink from '../StyledLink';
import { LinksWrapper } from './Styles';
import LinkItem from './LinkItem';
import env from '../../env.frontend';
import settings from '../../../settings.json';
import { get } from 'lodash';

export default function Howto({ groupSlug, PostId }) {
  const threadEmail = `${groupSlug}/${PostId}@${env.DOMAIN}`;
  const groupEmail = `${groupSlug}@${env.DOMAIN}`;
  return (
    <LinksWrapper>
      {PostId && (
        <LinkItem icon="↵">
          Reply to this thread by sending an email to <Link mailto={threadEmail}>{threadEmail}</Link>
        </LinkItem>
      )}
      {groupSlug && (
        <LinkItem icon="✉️">
          Start a new thread by sending an email to <Link mailto={groupEmail}>{groupEmail}</Link>
        </LinkItem>
      )}

      {get(settings, 'home.buttons', []).map(button => (
        <LinkItem>
          <Link href={button.url} color="black">
            {button.label}
          </Link>
        </LinkItem>
      ))}
    </LinksWrapper>
  );
}

Howto.propTypes = {
  groupSlug: PropTypes.string.isRequired,
  PostId: PropTypes.number,
};
