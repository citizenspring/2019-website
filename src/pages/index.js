import React from 'react';
import TopBar from '../components/TopBar/index.js';
import Footer from '../components/Footer/index.js';
import { Title, Content, PullQuote } from '../styles/layout';
import StyledLink from '../components/StyledLink';
import styled from 'styled-components';
import { mailto } from '../lib/utils';
import { Box, Flex } from '@rebass/grid';

const Cover = styled.div`
  margin: 2rem 0;
`;

const Font = styled.div`
  font-weight: bold;
  white-space: nowrap;
  font-size: ${({ size }) => `${size}px`};
`;

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
          <Flex flexDirection={['column', 'row', 'row']} alignItems="center">
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
          <PullQuote>"The future is already here. It's just not evenly distributed yet" - somebody famous.</PullQuote>
          <p>
            In the face of the climate emergency, we need to change the way we live and work. We need to embrace a much
            more sustainable future not only for the environment but also for our communities.
          </p>
          <p>
            The solutions are already in front of us: zero waste, local and circular economy, permaculture,
            micromobility, ... But they are still underground.
          </p>
          <p>
            <b>Citizen Spring is about emerging from that ground. Going to the surface. Together. 🌱</b>
          </p>
          <p>
            After all, we have a day of the industry where we visit the old economy. Let's have a day of the citizens
            initiatives where we can discover all the amazing things that citizens can do when they get together. 🤟
          </p>
          <p>
            During the first 4 days of Spring, citizen initiatives will open their doors to you, present what they do,
            how they got started and how you can contribute and join the movement! 🙌
          </p>
          <p>
            It will be totally decentralized. We will publish on this website all the activities happening in the
            different cities that participate.
          </p>
          <p>
            We are still working on some of the details. But please save the date 🗓 (
            <a href="https://www.facebook.com/events/2356473224576228">Facebook Event</a>) and stay in the loop! ♾
            <ul>
              <li>
                If you are a citizen initiative,{' '}
                <a href="https://goo.gl/forms/LmPU19GNVkzCYxTu1">register your initiative using this form</a>.
              </li>
              <li>
                If you want to help us organize or become a local coordinator for your city, join the{' '}
                <a href="/coordination">Coordination Group</a>.
              </li>
              <li>
                If you just want to stay in the loop, join our <a href="/newsletter">newsletter</a>.
              </li>
              <li>
                If you have any question, shoot us an email at{' '}
                <a href="mailto:info@citizenspring.be">info@citizenspring.be</a>
              </li>
            </ul>
          </p>

          <Flex flexDirection={['column', 'row', 'row']} alignItems="center" justifyContent="center">
            <Box py={4} mx={2}>
              <StyledLink href="https://goo.gl/forms/LmPU19GNVkzCYxTu1" buttonStyle="primary" buttonSize="medium">
                Register your citizen initiative
              </StyledLink>
            </Box>
            <Box mx={2}>
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
            </Box>
          </Flex>
        </Content>
        <Footer />
      </div>
    );
  }
}

export default HomePage;
