import React, { Component } from 'react';
import PropTypes from '../../lib/propTypes';
import { FooterWrapper, FooterTitle, FooterBackground, FooterSubtitle, FooterCopyLeft, FooterContent } from './Styles';
import settings from '../../../settings.json';
import Links from './Links';
import Link from '../Link';
import { Flex } from '@rebass/grid';

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
        <Flex flexDirection={['column', 'row', 'row']} justifyContent="space-between">
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
          <iframe
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FCitizenSpringBelgium%2F&tabs=events&width=320&height=400&small_header=false&adapt_container_width=true&hide_cover=true&show_facepile=true&appId=110203902358957"
            width="320"
            height="400"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
            style={{ zIndex: 20 }}
          />
        </Flex>
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
