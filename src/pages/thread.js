import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';

import Thread from '../containers/ThreadPage';

class ThreadPage extends React.Component {
  static getInitialProps({ req, res, query }) {
    if (res && req && req.locale == 'en') {
      res.setHeader('Cache-Control', 's-maxage=300');
    }

    return {
      groupSlug: query && query.groupSlug,
      threadSlug: query && query.threadSlug,
      query,
    };
  }

  static propTypes = {
    threadSlug: PropTypes.string, // from getInitialProps
    query: PropTypes.object, // from getInitialProps
  };

  async componentDidMount() {}

  render() {
    const { groupSlug, threadSlug } = this.props;
    return <Thread groupSlug={groupSlug} threadSlug={threadSlug} />;
  }
}

export default withIntl(ThreadPage);
