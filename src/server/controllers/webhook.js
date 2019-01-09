import libemail from '../lib/email';
import { parseEmailAddress, extractEmailsFromString, isEmpty } from '../lib/utils';
import { createJwt } from '../lib/auth';
import models from '../models';
import config from 'config';
import { get } from 'lodash';
import debugLib from 'debug';
const debug = debugLib('webhook');
import { handleIncomingEmail } from './emails';

async function handleFirstTimeUser(email, data) {
  if (!email['message-url']) {
    throw new Error('Invalid webhook payload: missing "message-url"');
  }

  const messageId = email['message-url'].substr(email['message-url'].lastIndexOf('/') + 1);
  const mailServer = email['message-url'].substring(8, email['message-url'].indexOf('.'));

  const tokenData = { messageId, mailServer };
  const token = createJwt('emailConfirmation', tokenData, '1h');
  data.confirmationUrl = `${config.server.baseUrl}/api/publishEmail?groupSlug=${data.groupSlug}&token=${token}`;

  if (isEmpty(email['stripped-text'])) {
    return await libemail.sendTemplate('confirmJoinGroup', data, email.sender);
  } else {
    data.post = {
      text: email['stripped-text'],
      html: email['stripped-html'],
    };
    return await libemail.sendTemplate('confirmEmail', data, email.sender);
  }
}

export default async function webhook(req, res) {
  const email = req.body;
  if (!email.recipient) {
    throw new Error('Invalid webhook payload: missing "recipient"');
  }
  debug('receiving email from:', email.sender, 'to:', email.recipient, 'subject:', email.subject);

  const { groupSlug, ParentPostId, PostId, action } = parseEmailAddress(email.recipient);
  const groupEmail = `${groupSlug}@${get(config, 'server.domain')}`.toLowerCase();

  // Ignore emails coming from ourselves (since we send emails to the group and cc recipients)
  const defaultEmailFrom = extractEmailsFromString(get(config, 'email.from'))[0];
  if (email.sender === groupEmail || email.sender === defaultEmailFrom) {
    console.info('Receiving email sent from the group to the group, discarding');
    return res.send('ok');
  }

  const group = await models.Group.findBySlug(groupSlug);
  let data = { groupSlug, action: {} };
  if (!group) {
    data.action.label = `create the ${groupSlug} group`;
  } else {
    data.action.label = `post my email to the ${groupSlug} group`;
  }
  if (action === 'follow') {
    if (PostId) {
      data.action.label = `follow this thread`;
    } else {
      data.action.label = `follow this group`;
    }
  }

  // Look if sender already has an account
  const user = await models.User.findByEmail(email.sender);

  // If no, we send a confirmation email before creating / publishing an account
  // the user will have to click the link provided in an email confirmation to publish their email to the group
  if (!user) {
    debug('user not found');
    await handleFirstTimeUser(email, data);
    return res.send('ok');
  }

  await handleIncomingEmail(email);

  return res.send('ok');
}
