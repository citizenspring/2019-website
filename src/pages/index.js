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
  text-align: center;
`;

const Font = styled.div`
  font-weight: bold;
  white-space: nowrap;
  font-size: ${({ size }) => `${size}px`};
`;

class HomePage extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div className="home">
        <TopBar />
        <Content>
          <Box my={4}>
            <center>
              <img src="/static/images/citizenspring-logo.svg" width="100%" style={{ maxWidth: '300px' }} />
            </center>
            <Cover>
              <Font size={36}>March 21-24 2019</Font>
              <Font size={30}>MEET THE CITIZENS</Font>
              <Font size={25}>that are taking initiatives</Font>
              <img src="/static/images/citizens-emoji.png" height={48} />
            </Cover>
            <Flex mt={4} flexDirection={'row'} justifyContent="center">
              <Box mx={2}>
                <StyledLink href="/antwerp" buttonStyle="standard" buttonSize="medium">
                  Antwerp
                </StyledLink>
              </Box>
              <Box mx={2}>
                <StyledLink href="/brussels" buttonStyle="standard" buttonSize="medium">
                  Brussels
                </StyledLink>
              </Box>
            </Flex>
          </Box>
          <Flex flexDirection={['column', 'row', 'row']} my={[0, 2, 4]}>
            <Box p={1}>
              <PullQuote>
                "The future is already here. It's just not evenly distributed yet" - somebody famous.
              </PullQuote>
              <p>
                In the face of the climate emergency, we need to change the way we live and work. We need to embrace a
                much more sustainable future not only for the environment but also for our communities.
              </p>
              <p>
                The solutions are already in front of us: zero waste, local and circular economy, permaculture,
                micromobility, ... But they are still underground.
              </p>
              <p>
                <b>Citizen Spring is about emerging from that ground. Going to the surface. Together. 🌱</b>
              </p>
              <p>
                After all, we have a day of the industry where we visit the old economy. Let's have a day of the
                citizens initiatives where we can discover all the amazing things that citizens can do when they get
                together. 🤟
              </p>
              <p>
                During the first 4 days of Spring, citizen initiatives will open their doors to you, present what they
                do, how they got started and how you can contribute and join the movement! 🙌
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
                    If you are a citizen initiative, register your citizen initiative in{' '}
                    <StyledLink href="/antwerp/events/new">Antwerp</StyledLink>, or{' '}
                    <StyledLink href="/brussels/events/new">Brussels</StyledLink>. If you are in another city,{' '}
                    <a href="https://goo.gl/forms/LmPU19GNVkzCYxTu1">use this form</a>.
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
                <Box mx={2} my={2}>
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
            </Box>
            <Flex alignSelf={['center', 'auto', 'auto']}>
              <Box mt={[5, 0, 0]} ml={[0, 2, 4]} width={320}>
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FCitizenSpringBelgium%2F&tabs=events&width=320&height=496&small_header=false&adapt_container_width=true&hide_cover=true&show_facepile=true&appId=110203902358957"
                  width="320"
                  height="496"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameborder="0"
                  allowTransparency="true"
                  allow="encrypted-media"
                />
              </Box>
            </Flex>
          </Flex>
        </Content>
        <Footer />
      </div>
    );
  }
}

export default HomePage;
