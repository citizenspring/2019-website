import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';

import Thread from '../containers/ThreadPage';

class ThreadPage extends React.Component {
  static getInitialProps({ req, res, query }) {
    if (res && req && req.locale == 'en') {
      res.setHeader('Cache-Control', 's-maxage=300');
    }

    return { threadSlug: query && query.threadSlug, query };
  }

  static propTypes = {
    threadSlug: PropTypes.string, // from getInitialProps
    query: PropTypes.object, // from getInitialProps
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {}

  render() {
    return <Thread threadSlug={this.props.threadSlug} />;
  }
}

export default withIntl(ThreadPage);
