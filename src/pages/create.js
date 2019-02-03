import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';

import CreateGroup from '../containers/CreateGroupPage';

class CreateGroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentDidMount() {}

  onSubmit(form) {
    console.log('>>> onSubmit', form);
  }

  render() {
    return <CreateGroup onSubmit={this.onSubmit} />;
  }
}

export default withIntl(CreateGroupPage);
