import React, { Component } from 'react';
import PropTypes from '../../lib/propTypes';
import { FooterWrapper, FooterTitle, FooterSubtitle } from './Styles';
import Link from '../Link';
import settings from '../../../settings.json';
import Links from './Links';

class Footer extends Component {
  static propTypes = {
    group: PropTypes.nodeType('Group'),
    editUrl: PropTypes.string,
  };

  render() {
    const { group, editUrl } = this.props;
    const groupSlug = group && group.slug;
    return (
      <FooterWrapper>
        <FooterTitle>
          <Link href="/" color="black">
            {settings.name}
          </Link>
        </FooterTitle>
        {groupSlug && (
          <FooterSubtitle>
            <Link href={`/${groupSlug}`} color="#333">
              {group.name}
            </Link>
          </FooterSubtitle>
        )}
        <Links groupSlug={groupSlug} editUrl={editUrl} />
      </FooterWrapper>
    );
  }
}

export default Footer;
