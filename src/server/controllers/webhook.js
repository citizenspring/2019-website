import libemail from '../lib/email';
import { parseEmailAddress, extractEmailsFromString, isEmpty } from '../lib/utils';
import { createJwt } from '../lib/auth';
import models from '../models';
import config from 'config';
import { get } from 'lodash';
import debugLib from 'debug';
const debug = debugLib('webhook');
import { handleIncomingEmail } from './emails';
import LRU from 'lru-cache';
const cache = new LRU(50);

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

export default async function webhook(req, res, next) {
  const email = req.body;
  if (!email.recipient) {
    throw new Error('Invalid webhook payload: missing "recipient"');
  }
  if (cache.get(email['Message-Id'])) {
    console.warn('!!! duplicate email', email['Message-Id']);
    return res.send('duplicate');
  }
  cache.set(email['Message-Id'], true);
  debug('receiving email from:', email.sender, 'to:', email.recipient, 'subject:', email.subject);

  // when replying from gmail to "testgroup@citizenspring.be" <testgroup/28/29@citizenspring.be>,
  // the email.recipient becomes testgroup/28/29@citizenspring.be, testgroup@citizenspring.be
  if (email.recipient.indexOf(', ') !== -1) {
    email.recipient = email.recipient.split(', ')[0];
  }
  const { groupSlug, ParentPostId, PostId, action } = parseEmailAddress(email.recipient);
  const groupEmail = `${groupSlug}@${get(config, 'server.domain')}`.toLowerCase();

  // Ignore emails coming from ourselves (since we send emails to the group and cc recipients)
  const defaultEmailFrom = extractEmailsFromString(get(config, 'email.from'))[0];
  if (email.sender === groupEmail || email.sender === defaultEmailFrom) {
    console.info('Receiving email sent from the group to the group, discarding');
    return res.send('ok');
  }

  const group = await models.Group.findBySlug(groupSlug, 'PUBLISHED');
  let data = { groupSlug, action: {} };
  if (!group) {
    data.action.label = `create the ${groupSlug} group`;
  } else {
    data.action.label = `post my email to the ${groupSlug} group`;
  }
  if (['follow', 'join', 'subscribe'].includes(action)) {
    if (PostId) {
      data.action.label = `${action} this thread`;
    } else {
      data.action.label = `${action} this group`;
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

  try {
    await handleIncomingEmail(email);
  } catch (e) {
    await libemail.sendTemplate(
      'error',
      {
        subject: e.message.indexOf('>') !== -1 ? e.message.replace(/^[^ ]+> /, '') : e.message,
        body: `An error occured. Please try again or contact support@${get(config, 'server.domain')}`,
        email,
      },
      user.email,
    );
    console.error(e);
    return res.send('ok');
  }

  return res.send('ok');
}
