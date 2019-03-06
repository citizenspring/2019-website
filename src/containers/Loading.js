import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

import { Box, Flex } from '@rebass/grid';
import { Title, Content, DescriptionBlock } from '../styles/layout';

import { FormattedMessage } from 'react-intl';

class Loading extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    groupSlug: PropTypes.string,
  };

  render() {
    const { intl, groupSlug } = this.props;
    return (
      <div>
        <TopBar group={{ slug: groupSlug }} />
        <Content>
          <Flex justifyContent="center" my={5} mx={2} flexDirection="column">
            <Title>
              <FormattedMessage id="loading" defaultMessage="loading" />
            </Title>
            <DescriptionBlock>
              <FormattedMessage id="loading.pleaseWait" defaultMessage="Please wait..." />
            </DescriptionBlock>
          </Flex>
        </Content>
        <Footer />
      </div>
    );
  }
}

export default withIntl(Loading);
