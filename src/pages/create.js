import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import yaml from 'js-yaml';

import CreateGroup from '../containers/CreateGroupPage';
import { mailto } from '../lib/utils';

class CreateGroupPage extends React.Component {
  static getInitialProps({ query: { hostCollectiveSlug } }) {
    const scripts = { googleMaps: true }; // Used in <InputTypeLocation>
    return { scripts };
  }
  constructor(props) {
    super(props);
    this.state = {};
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentDidMount() {}

  onSubmit(form) {
    const yamlString = yaml.safeDump(form);
    console.log('>>> onSubmit', form);
    console.log('>>> yamlString', yamlString);
    const body = `Just send this email to register without modification\n\n---\n${yamlString}---\n`;
    const a = document.createElement('a');
    a.href = mailto('registrations@citizenspring.be', 'submit', form.name, body);
    console.log('>>> email body', body);
    console.log('>>> a.href', a.href);
    a.click();
  }

  render() {
    return <CreateGroup onSubmit={this.onSubmit} />;
  }
}

export default withIntl(CreateGroupPage);
