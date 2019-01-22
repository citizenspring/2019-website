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

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ButtonItem = styled.div`
  margin: 1rem 0.5rem;
`;

const Cover = styled.div`
  margin: 2rem 0;
`;

const Font = styled.div`
  font-weight: bold;
  white-space: nowrap;
  font-size: ${({ size }) => `${size}px`};
`;

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

class HomePage extends React.Component {
  componentDidMount() {
    setTimeout(() => {
      window.addeventatc && window.addeventatc.refresh();
    }, 500);
  }

  render() {
    return (
      <div className="home">
        <TopBar />
        <Content>
          <Flex justifyContent={['center', 'left', 'left']}>
            <Title>#CitizenSpring🌱</Title>
          </Flex>
          <Flex flexDirection={['column', 'row', 'row']} alignItems="center" justifyContent="space-between">
            <Box>
              <Cover>
                <Font size={36}>March 21-24 2019</Font>
                <Font size={32}>MEET THE CITIZENS</Font>
                <Font size={27}>that are taking initiatives</Font>
                <Font size={42}>🙋🏻‍♀️🙋🏼‍♂️🙋🏽‍♀️🙋🏿‍♂️🙋🏼‍♀️🙋🏾‍♀️🙋🏻‍♂️</Font>
              </Cover>
            </Box>
            <Box my={4} width={1}>
              <center>
                <div title="Add to Calendar" className="addeventatc">
                  Add to Calendar
                  <span class="start">21-03-2019 08:00 AM</span>
                  <span class="end">24-03-2019 6:00 PM</span>
                  <span class="timezone">Europe/Brussels</span>
                  <span class="title">#CitizenSpring🌱 days</span>
                  <span class="description">
                    Meet the citizen initiatives in your city! More info on https://citizenspring.be
                  </span>
                  <span class="location">In every city!</span>
                  <span class="organizer_email">info@citizenspring.be</span>
                  <span class="facebook_event">https://www.facebook.com/events/2356473224576228</span>
                  <span class="all_day_event">true</span>
                  <span class="status">CONFIRMED</span>
                </div>
              </center>
            </Box>
          </Flex>
          <p>
            We have a day of the industry where we visit the old economy. It's about time that we also have a day of the
            citizens where we can discover the new economy and all the amazing things that citizens can do when they get
            together! 🤟
          </p>
          <p>
            During those 4 days, we will all open our doors, present what we do, how we got started and how citizens can
            contribute! 🙌
          </p>
          <p>
            It will be totally decentralized. We will publish on this website all the activities happening across the
            country. 🇧🇪
          </p>
          <p>
            We are still working on some of the details. But please save the date 🗓 (
            <a href="https://www.facebook.com/events/2356473224576228">Facebook Event</a>) and stay in the loop! ♾
            <ul>
              <li>
                If you are a citizen initiative, join the <a href="/citizeninitiatives">Citizen Initiatives Group</a>.
              </li>
              <li>
                If you want to become a local coordinator, join the <a href="/coordinators">Coordinators Group</a>.
              </li>
              <li>
                If you want to volunteer to organize this event, join the <a href="/volunteers">Volunteers Group</a>.
              </li>
              <li>
                If you just want to stay in the loop, join our <a href="/newsletter">newsletter</a>.
              </li>
            </ul>
          </p>

          <Buttons>
            <ButtonItem>
              <StyledLink href="https://goo.gl/forms/LmPU19GNVkzCYxTu1" buttonStyle="primary" buttonSize="medium">
                Register your citizen initiative
              </StyledLink>
            </ButtonItem>
            <ButtonItem>
              <StyledLink
                href={mailto(
                  'newsletter@citizenspring.be',
                  'follow',
                  'Subscribe to the Citizen Spring newsletter',
                  'Just send this email to subscribe to the Citizen Spring newsletter and stay up to date with our latest news and progress!',
                )}
                buttonStyle="standard"
                buttonSize="medium"
              >
                Subscribe to our newsletter
              </StyledLink>
            </ButtonItem>
          </Buttons>

          <Subtitle>
            <FormattedMessage id="homepage.latestPosts" defaultMessage="Latest posts" />
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

export default HomePage;
