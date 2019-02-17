import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TopBarWrapper, TopBarItem, LeftMenu, RightMenu } from './Styles';
import Icon from '../Icon';
import Link from '../Link';
import settings from '../../../settings.json';

class TopBar extends Component {
  static propTypes = {
    group: PropTypes.object,
  };

  render() {
    const { group } = this.props;
    const pinnedPosts = [
      { path: '/brussels/posts/faq-86', title: 'FAQ' },
      { path: '/groups', title: 'working groups' },
    ];

    return (
      <TopBarWrapper>
        <LeftMenu>
          <TopBarItem>
            <Icon height={18} />
          </TopBarItem>
          <TopBarItem>
            <Link href="/" color="white">
              {settings.name}
            </Link>
          </TopBarItem>
          {group && (
            <TopBarItem>
              <Link href={`/${group.slug}`} color="#ddd">
                {group.name || group.slug}
              </Link>
            </TopBarItem>
          )}
        </LeftMenu>
        <RightMenu>
          {pinnedPosts &&
            pinnedPosts.map((post, key) => (
              <TopBarItem key={key}>
                <Link href={post.path} color="#ddd">
                  {post.title}
                </Link>
              </TopBarItem>
            ))}
        </RightMenu>
      </TopBarWrapper>
    );
  }
}

export default TopBar;
