import React from 'react';
import TopBar from '../components/TopBar/index.js';
import Footer from '../components/Footer/index.js';
import GroupsWithData from '../components/Groups/withData.js';
import { Title, Content } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import env from '../env.frontend';
import StyledLink from '../components/StyledLink';
import styled from 'styled-components';
import settings from '../../settings.json';
import { mailto } from '../lib/utils';

const H2 = props => <h2 style={{ fontWeight: 300 }} {...props} />;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ButtonItem = styled.div`
  margin: 1rem 0.5rem;
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
    mailto: mailto('', instructions.subject, instructions.body),
    style: 'standard',
  },
];

export default () => (
  <div className="home">
    <TopBar />
    <Content>
      <Title>{settings.name}</Title>
      <H2>{settings.description}</H2>
      <p>{settings.longDescription}</p>

      <Buttons>
        <ButtonItem>
          <StyledLink href="https://goo.gl/forms/r2R8vFzcwrpKJaUp1" buttonStyle="primary" buttonSize="medium">
            Join as a volunteer!
          </StyledLink>
        </ButtonItem>
        <ButtonItem>
          <StyledLink
            href={mailto(
              'newsletter/follow@citizenspring.be',
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

      <TitleWithActions subtitle="Join a working group" actions={actions} />
      <GroupsWithData />
    </Content>
    <Footer />
  </div>
);
