import React, { Component } from 'react';
import PropTypes from '../../lib/propTypes';
import { FooterWrapper, FooterTitle, FooterBackground, FooterSubtitle, FooterCopyLeft, FooterContent } from './Styles';
import settings from '../../../settings.json';
import Links from './Links';
import Link from '../Link';

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
        <FooterContent>
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
          <Links group={group} editUrl={editUrl} />
        </FooterContent>
        <FooterCopyLeft>
          Copyleft 2019 Citizen Spring Collective - please copy / steal / modify / contribute;{' '}
          <a href="https://github.com/citizenspring/website">our code is on Github (MIT license)</a>
        </FooterCopyLeft>
        <FooterBackground />
      </FooterWrapper>
    );
  }
}

export default Footer;
