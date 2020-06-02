import React from 'react';
import TopBar from '../components/TopBar/index.js';
import Footer from '../components/Footer/index.js';
import { Title, Content, PullQuote } from '../styles/layout';
import StyledLink from '../components/StyledLink';
import Link from '../components/Link';
import styled from 'styled-components';
import { mailto } from '../lib/utils';
import { Box, Flex } from '@rebass/grid';
import { FormattedMessage } from 'react-intl';
import withIntl from '../lib/withIntl';

const Cover = styled.div`
  margin: 2rem 0;
  text-align: center;
`;

const Font = styled.div`
  font-weight: bold;
  white-space: nowrap;
  font-size: ${({ size }) => `${size}px`};
`;

const Links = styled.ul`
  list-style: none;
  text-align: center;
  & li {
    display: inline;
    margin-right: 10px;
  }
`;

class HomePage extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div className="home">
        <Content>
          <Box my={4}>
            <center>
              <img src="/static/images/citizenspring-logo.svg" width="100%" style={{ maxWidth: '300px' }} />
            </center>
            <Cover>
              <Font size={36}>Walking the walk</Font>
              <Font size={21}>towards a sustainable future</Font>
              <img src="/static/images/citizens-emoji.png" height={48} />
            </Cover>
            <Links>
              <li><a href="https://facebook.com/citizenspringmovement">Facebook</a></li>
              <li><a href="https://twitter.com/citizen_spring">Twitter</a></li>
              <li><a href="https://opencollective.com/citizenspring">Open Collective</a></li>
            </Links>
          </Box>
        </Content>
      </div>
    );
  }
}

export default withIntl(HomePage);
