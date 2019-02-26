import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import PostList from './PostList';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

import { Content, DescriptionBlock } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import RichText from '../components/RichText';
import { mailto } from '../lib/utils';

import env from '../env.frontend';
import { FormattedMessage } from 'react-intl';
import Metadata from '../components/Group/EventsMetadata';
import MapMarkers from '../components/MapMarkers';
import Banner from '../components/Group/Banner';
import TagsSelector from '../components/TagsSelectorWithData';

import { get } from 'lodash';
import { Box, Flex } from '@rebass/grid';

class EventsGroupPage extends React.Component {
  static propTypes = {
    group: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    tag: PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { group, tag } = this.props;
    const groupEmail = `${group.slug}@${env.DOMAIN}`;
    const template = get(group, 'settings.template');
    const actions = [
      {
        label: 'follow',
        href: mailto(
          groupEmail,
          'follow',
          `Follow ${group.name}`,
          'Just send this email be notified whenever a new event is published in this group',
        ),
        style: 'standard',
      },
      {
        label: 'add event',
        href: `/${group.slug}/events/new`,
      },
    ];

    const editMailto = mailto(groupEmail, 'edit', group.title, group.description);

    return (
      <div>
        <TopBar group={group} />
        <Banner groupSlug={group.slug} />
        <Content>
          <DescriptionBlock>
            <RichText html={group.description} mailto={editMailto}>
              {!group.description && (
                <FormattedMessage id="group.description.empty" defaultMessage="no group description" />
              )}
            </RichText>
          </DescriptionBlock>
          <TagsSelector groupSlug={group.slug} selected={tag} />
          <Box mb={3}>
            <MapMarkers group={group} />
          </Box>
          <PostList groupSlug={group.slug} posts={group.posts} />
        </Content>
        <Footer group={group} editUrl={editMailto} />
      </div>
    );
  }
}

export default withIntl(EventsGroupPage);
