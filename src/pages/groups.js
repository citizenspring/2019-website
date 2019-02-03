import React from 'react';
import TopBar from '../components/TopBar/index.js';
import Footer from '../components/Footer/index.js';
import GroupsWithData from '../components/Groups/withData.js';
import PostsWithData from '../components/Posts/withData.js';
import { Title, Subtitle, Content } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import env from '../env.frontend';
import StyledLink from '../components/StyledLink';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { mailto } from '../lib/utils';
import { Box, Flex } from '@rebass/grid';

const instructions = {
  subject: 'Create a new working group',
  body: `Just send this email to :group@${env.DOMAIN}
where :group is the name of your group (without spaces or special characters)
E.g. design@${env.DOMAIN}, press@${env.DOMAIN}, a_team@${env.DOMAIN}

Proptip: you can cc the people that you want to add to the group`,
};
const actions = [
  {
    label: '+ Create a Group',
    href: mailto('', null, instructions.subject, instructions.body),
    style: 'standard',
  },
];

class GroupsPage extends React.Component {
  render() {
    const pinnedPosts = [{ path: '/brussels/faq-86', title: 'FAQ' }];
    return (
      <div className="home">
        <TopBar pinnedPosts={pinnedPosts} />
        <Content>
          <Flex justifyContent={['center', 'left', 'left']}>
            <Title>#CitizenSpring🌱 - Groups</Title>
          </Flex>
          <Subtitle>
            <FormattedMessage id="homepage.latestMessages" defaultMessage="Latest messages" />
          </Subtitle>
          <PostsWithData limit={5} />
          <TitleWithActions subtitle="Join a working group" actions={actions} />
          <GroupsWithData />
        </Content>
        <Footer />
      </div>
    );
  }
}

export default GroupsPage;
