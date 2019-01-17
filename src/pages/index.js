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
      <p>
        We are millions of citizens who are tired of watching passively climate change and social unrest happening
        around us. We want to do something about it.
      </p>
      <p>
        But how can we work together in a coordinated fashion?
        <br />
        Let's start by splitting ourselves into small working groups or collectives that will offer one service to one
        another. It could be anything: skill based (a collective of designers, of video editors, translators,
        facilitators, etc.), service based (offering facilitation for meetings, special service for immigrants or low
        income people, etc.) or event based (offering space, catering, event organizing, ...). Whatever your skills are
        or whatever you have access to, you have something to contribute to this human organization. Each contribution
        matters. Each contribution is a piece of the chain that we need to face the challenges of our time.
      </p>
      <p>
        To make this work, each collective or group will share the same basic structure:
        <ul>
          <li>one email address to reach out to them (groupname@citizenspring.be)</li>
          <li>one dedicated page (https://citizenspring.be/groupname)</li>
        </ul>
        They will all be open, transparent and inclusive. Anyone can join and participate or make a request.
        <br />
        This way, it will be easy to have an overview of all the different citizen collectives, see what they are up to,
        see what they have to offer to the community and have a standard way to reach out to them.
      </p>
      <p>
        Create your group or your collective and let's explore how we can create together an open organization to
        address the challenges of our time wherever we are.
      </p>
      <p>We can do great things together! Let's do it! 🙌</p>

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
