import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

import { Box, Flex } from '@rebass/grid';
import { Title, Content, DescriptionBlock } from '../styles/layout';
import { mailto } from '../lib/utils';

import env from '../env.frontend';
import { FormattedMessage, defineMessages } from 'react-intl';

class GroupNotFound extends React.Component {
  static propTypes = {
    groupSlug: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.messages = defineMessages({
      'group.create.email.body': {
        id: 'group.create.email.body',
        defaultMessage:
          'Just send this email and cc the first members of this group.\n\nOnce the group is created, all emails sent to {groupEmail} will be sent to all the members and published online on {groupUrl}.',
      },
    });
  }

  render() {
    const { intl, groupSlug } = this.props;
    const groupEmail = `${groupSlug}@${env.DOMAIN}`;
    const groupUrl = `https://${env.DOMAIN}/${groupSlug}`;
    return (
      <div>
        <TopBar group={{ slug: groupSlug }} />
        <Content>
          <Flex justifyContent="center" my={5} mx={2} flexDirection="column">
            <Title>
              <FormattedMessage id="group.notFound.title" defaultMessage="Group not found" />
            </Title>
            <DescriptionBlock>
              <FormattedMessage
                id="group.notFound.description"
                defaultMessage="You can create this group by sending an empty email to {groupEmail}"
                values={{
                  groupEmail: (
                    <a
                      href={mailto(
                        groupEmail,
                        '',
                        '',
                        intl.formatMessage(this.messages['group.create.email.body'], { groupEmail, groupUrl }),
                      )}
                    >
                      {groupEmail}
                    </a>
                  ),
                }}
              />
            </DescriptionBlock>
          </Flex>
        </Content>
        <Footer />
      </div>
    );
  }
}

export default withIntl(GroupNotFound);
