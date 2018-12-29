import libemail from '../lib/email';
import { extractInboxAndTagsFromEmailAddress } from '../lib/utils';
import { createJwt } from '../lib/auth';
import models from '../models';
import config from 'config';

async function handleFirstTimeUser(groupSlug, email) {
  if (!email['message-url']) {
    throw new Error('Invalid webhook payload: missing "message-url"');
  }

  const messageId = email['message-url'].substr(email['message-url'].lastIndexOf('/') + 1);
  const mailServer = email['message-url'].substring(8, email['message-url'].indexOf('.'));

  const tokenData = { messageId, mailServer };
  const token = createJwt('emailConfirmation', tokenData, '1h');
  const data = {
    groupSlug,
    confirmationUrl: `${config.collective.website}/api/publishEmail?groupSlug=${groupSlug}&token=${token}`,
  };
  return await libemail.sendTemplate('createUser', data, [email.sender]);
}

export default async function webhook(req, res, next) {
  if (!req.body.recipient) {
    throw new Error('Invalid webhook payload: missing "recipient"');
  }

  // Look if sender already has an account
  const users = await models.User.findAll();
  const user = await models.User.findByEmail(req.body.sender);
  const { inbox: groupSlug } = extractInboxAndTagsFromEmailAddress(req.body.recipient);

  // If no, we send a confirmation email before creating / publishing an account
  // the user will have to click the link provided in an email confirmation to publish their email to the group
  if (!user) {
    await handleFirstTimeUser(groupSlug, req.body);
    return res.send('ok');
  }

  await models.Post.createFromEmail(req.body);

  return res.send('ok');
}
