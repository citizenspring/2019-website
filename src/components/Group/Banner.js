import React from 'react';
import withIntl from '../../lib/withIntl';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Flex, Box } from '@rebass/grid';
import Link from '../Link';
import StyledLink from '../StyledLink';

const Banner = styled.div`
  width: 100%;
  padding: 8px;
  overflow: hidden;
  background: #e0f1ff;
`;

const Title = styled.h1`
  font-weight: 300;
  font-size: 16px;
  margin-bottom: 4px;
`;

const Description = styled.p`
  font-weight: 300;
  font-size: 13px;
  line-height: 1.3;
  margin-top: 4px;
`;

class MapMarkers extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { groupSlug } = this.props;
    return (
      <Banner>
        <Flex alignItems="center" justifyContent="space-around">
          <Box>
            <Title>
              <FormattedMessage id="eventsGroup.banner.title" defaultMessage="Register your citizen initiative!" />
            </Title>
            <Description>
              <FormattedMessage
                id="eventsGroup.banner.description"
                defaultMessage="You just need to open your doors one of the first few days of Spring (March 21-24) to join the movement!"
              />
            </Description>
          </Box>
          <Box mx={3}>
            <Link href={`/${groupSlug}/events/new`}>
              <StyledLink buttonStyle={'primary'} buttonSize="medium">
                <FormattedMessage id="eventsGroup.banner.btn" defaultMessage="register" />
              </StyledLink>
            </Link>
          </Box>
        </Flex>
      </Banner>
    );
  }
}

export default withIntl(MapMarkers);
