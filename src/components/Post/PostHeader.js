import React from 'react';
import PropTypes from '../../lib/propTypes';
import Moment from 'react-moment';
import Avatar from '../Avatar';

import { PostHeaderWrapper, Metadata, Reaction } from './Styles';
import { MetadataItem } from '../../styles/layout';
import withIntl from '../../lib/withIntl';
import { defineMessages, FormattedMessage } from 'react-intl';
import Link from '../Link';
import { Box } from '@rebass/grid';

class PostHeader extends React.Component {
  static propTypes = {
    user: PropTypes.nodeType('User').isRequired,
    createdAt: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.messages = defineMessages({
      reaction: { id: 'post.header.verb.reaction', defaultMessage: 'reacted' },
      response: { id: 'post.header.verb.response', defaultMessage: 'replied' },
      submission: { id: 'post.header.verb.submission', defaultMessage: 'submitted' },
    });
  }

  render() {
    const { intl, createdAt, reaction, user, editUrl, type } = this.props;
    const timestamp = new Date(Number(createdAt));
    let verb = reaction ? 'reaction' : 'response';
    if (type === 'EVENT') {
      verb = 'submission';
    }
    return (
      <PostHeaderWrapper>
        {reaction && <Reaction>{reaction}</Reaction>}
        {!reaction && (
          <Box mr={2}>
            <Avatar user={user} />
          </Box>
        )}
        <MetadataItem>
          {user.name} {intl.formatMessage(this.messages[verb])} <Moment fromNow>{timestamp}</Moment>
        </MetadataItem>
        {editUrl && (
          <MetadataItem>
            |{' '}
            <Link href={editUrl} className="edit">
              ✏️
              <FormattedMessage id="edit" defaultMessage="edit" />
            </Link>
          </MetadataItem>
        )}
      </PostHeaderWrapper>
    );
  }
}

export default withIntl(PostHeader);
