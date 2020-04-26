import React from 'react';
import TopBar from '../../components/TopBar/index.js.js';
import Footer from '../../components/Footer/index.js.js';
import { Title, Content, PullQuote } from '../../styles/layoutout';
import StyledLink from '../../components/StyledLinkink';
import Link from '../../components/Linkink';
import styled from 'styled-components';
import { mailto } from '../../lib/utilsils';
import { Box, Flex } from '@rebass/grid';
import { FormattedMessage } from 'react-intl';
import withIntl from '../../lib/withIntlntl';

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
            <center>
              <FormattedMessage id="homepage.pickYourCity" defaultMessage="Pick your city" />
            </center>
            <Flex mt={4} flexDirection={'row'} justifyContent="center">
              <Box mx={2}>
                <Link prefetch href="/antwerp">
                  <StyledLink buttonStyle="white" buttonSize="medium">
                    ANTWERP
                  </StyledLink>
                </Link>
              </Box>
              <Box mx={2}>
                <Link prefetch href="/brussels">
                  <StyledLink buttonStyle="white" buttonSize="medium">
                    BRUSSELS
                  </StyledLink>
                </Link>
              </Box>
            </Flex>
          </Box>
        </Content>
        <Footer />
      </div>
    );
  }
}

export default withIntl(HomePage);
