import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TopBarWrapper, TopBarItem, LeftMenu, RightMenu } from './Styles';
import Icon from '../Icon';
import Link from '../Link';
import settings from '../../../settings.json';
import withIntl from '../../lib/withIntl';

const getPinnedPosts = locale => {
  const posts = [];
  switch (locale) {
    case 'en':
      posts.push({ path: '/groups', title: 'Working groups' });
      posts.push({ path: '/brussels/posts/faq-86', title: 'FAQ' });
      posts.push({ path: '/info/posts/about-355', title: 'About' });
      break;
    case 'fr':
      posts.push({ path: '/groups', title: 'Groupes de travail' });
      posts.push({ path: '/brussels/posts/faq-86', title: 'FAQ' });
      posts.push({ path: '/brussels/posts/a-propos-208', title: 'A propos' });
      break;
    case 'nl':
      posts.push({ path: '/groups', title: 'Werkgroepen' });
      posts.push({ path: '/antwerp/posts/faq-voor-burgerinitiatieven-en-bezoekers-nederlands-129', title: 'FAQ' });
      posts.push({ path: '/info/posts/over-363', title: 'Over' });
      break;
  }
  return posts;
};

class TopBar extends Component {
  static propTypes = {
    group: PropTypes.object,
  };

  render() {
    const { group } = this.props;

    return (
      <TopBarWrapper>
        <LeftMenu>
          <TopBarItem>
            <img src="/static/images/citizenspring-logo-white-icon.png" height={18} />
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
          {getPinnedPosts(this.props.intl.locale).map((post, key) => (
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

export default withIntl(TopBar);
