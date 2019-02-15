import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import { get } from 'lodash';

import Group from '../containers/GroupPage';

class GroupPage extends React.Component {
  static getInitialProps({ req, res, query }) {
    if (res && req && req.locale == 'en') {
      res.setHeader('Cache-Control', 's-maxage=300');
    }

    return { groupSlug: get(query, 'groupSlug'), tag: get(query, 'tag'), query };
  }

  static propTypes = {
    groupSlug: PropTypes.string, // from getInitialProps
    query: PropTypes.object, // from getInitialProps
    data: PropTypes.object.isRequired, // from withData
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {}

  render() {
    const { groupSlug, tag } = this.props;
    return <Group groupSlug={groupSlug} tag={tag} />;
  }
}

export default withIntl(GroupPage);
