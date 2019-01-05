import React from 'react';
import settings from '../../settings.json';
import { get } from 'lodash';
import TopBar from '../components/TopBar/index.js';
import Footer from '../components/Footer/index.js';
import GroupsWithData from '../components/Groups/withData.js';
import { Title, Content } from '../styles/layout';
import TitleWithActions from '../components/TitleWithActions';
import env from '../env.frontend';
import StyledLink from '../components/StyledLink';
import styled from 'styled-components';

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
    mailto: `?subject=${encodeURIComponent(instructions.subject)}&body=${encodeURIComponent(instructions.body)}`,
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
        {get(settings, 'home.buttons', []).map(button => (
          <ButtonItem>
            <StyledLink href={button.url} buttonStyle="standard" buttonSize="small">
              {button.label}
            </StyledLink>
          </ButtonItem>
        ))}
      </Buttons>
      <TitleWithActions title="Working Groups" actions={actions} />
      <GroupsWithData />
    </Content>
    <Footer />
  </div>
);
