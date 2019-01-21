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
    href: mailto('', null, instructions.subject, instructions.body),
    style: 'standard',
  },
];

export default () => (
  <div className="home">
    <TopBar />
    <Content>
      <Title>#CitizenSpring🌱</Title>
      <H2>March 21-24, meet the citizens that are taking initiatives!</H2>
      <p>
        We have a day of the industry where we visit the old economy. It's about time that we also have a day of the
        citizens where we can discover the new economy and all the amazing things that citizens can do when they get
        together!
      </p>
      <p>
        During those 4 days, we will all open our doors, present what we do, how we got started and how can citizens
        contribute!
      </p>
      <p>
        It will be totally decentralized. We will publish on this website all the activities happening across the
        country.
      </p>
      <p>
        We are still figuring out the details. But please save the date and stay in the loop!
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
          <StyledLink href="https://goo.gl/forms/r2R8vFzcwrpKJaUp1" buttonStyle="primary" buttonSize="medium">
            Join as a volunteer!
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

      <TitleWithActions subtitle="Join a working group" actions={actions} />
      <GroupsWithData />
    </Content>
    <Footer />
  </div>
);
