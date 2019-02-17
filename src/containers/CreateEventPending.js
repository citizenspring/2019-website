import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import { FormattedMessage, defineMessages } from 'react-intl';

class CreateEventPending extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
  };

  render() {
    const { email } = this.props;
    return (
      <p>
        <FormattedMessage
          id="createEvent.pending"
          defaultMessage="Please confirm your registration using the link we just sent to {email}"
          values={{ email }}
        />
      </p>
    );
  }
}

export default withIntl(CreateEventPending);
