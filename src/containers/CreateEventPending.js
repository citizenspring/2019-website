import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { Box, Flex } from '@rebass/grid';

import { Title, Content, Description } from '../styles/layout';
import { FormattedMessage, defineMessages } from 'react-intl';

class CreateEventPending extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
  };

  render() {
    const { email } = this.props;
    return (
      <div>
        <TopBar />
        <Content>
          <Title>
            <FormattedMessage id="createEvent.title" defaultMessage="One last step" />
          </Title>
          <p>
            <FormattedMessage
              id="createEvent.pending"
              defaultMessage="Please confirm your registration using the link we just sent to {email}"
              values={{ email }}
            />
          </p>
        </Content>
        <Footer />
      </div>
    );
  }
}

export default withIntl(CreateEventPending);
