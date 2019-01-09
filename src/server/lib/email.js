import debugLib from 'debug';
const debug = debugLib('email');
import { get, uniq } from 'lodash';
import nodemailer from 'nodemailer';
import env from '../env';
import { parseEmailAddress, extractNamesAndEmailsFromString } from '../lib/utils';
import { createJwt } from '../lib/auth';
import path from 'path';
import fs from 'fs';
import models from '../models';

import { render } from '../templates';

const libemail = {};

console.log(`> Using mailgun account ${env.MAILGUN_USER}`);

libemail.generateUnsubscribeUrl = async function(email, where) {
  const user = await models.User.findByEmail(email);
  if (!user) {
    console.warn(`Cannot generate unsubscribe url for ${email}: user not found`);
    return null;
  }
  where.role = 'FOLLOWER';
  where.UserId = user.id;
  const member = await models.Member.findOne({ where });
  if (!member) {
    console.warn('libemail.generateUnsubscribeUrl: no membership found for', where);
    return;
  }
  const tokenData = {
    data: { MemberId: member.id },
  };
  const token = createJwt('unfollow', tokenData, '7d');
  return `${env.BASE_URL}/api/unfollow?token=${token}`;
};

libemail.generateSubscribeUrl = async function(email, memberData) {
  const user = await models.User.findByEmail(email);
  if (!user) {
    console.warn(`Cannot generate subscribe url for ${email}: user not found`);
    return null;
  }
  memberData.role = 'FOLLOWER';
  memberData.UserId = user.id;
  const token = createJwt('follow', { data: memberData }, '7d');
  return `${env.BASE_URL}/api/follow?token=${token}`;
};

/**
 * returns headers of an email object as sent by mailgun
 * @POST { sender: email, groupSlug, tags: [string], recipients: [{name, email}], ParentPostId, PostId }
 */
libemail.parseHeaders = function(email) {
  if (!email.sender) {
    throw new Error('libemail.parseHeaders: invalid email object');
  }
  const sender = email.sender.toLowerCase();
  const recipient = (email.recipient || email.recipients || '').toLowerCase(); // mailgun's inconsistent api
  const parsedSenderEmail = parseEmailAddress(sender);
  const parsedRecipientEmail = parseEmailAddress(recipient);
  const recipients = extractNamesAndEmailsFromString(`${email.To}, ${email.Cc}`).filter(r => {
    if (!r.email) return false;
    if (r.email === recipient) return false;
    const parsedEmail = parseEmailAddress(r.email);
    if (parsedEmail.email === parsedRecipientEmail.email) return false;
    if (parsedEmail.email === parsedSenderEmail.email) return false;
    return true;
  });
  return { sender, ...parsedRecipientEmail, recipients };
};

/**
 * Generate template with data and send html email to recipients
 * @pre: recipients: array(email)
 */
libemail.sendTemplate = async function(template, data, to, options = {}) {
  if ((options.exclude || []).includes(to)) {
    throw new Error(`Recipient is in the exclude list (${to})`);
  }
  const cc = uniq((options.cc || []).map(r => r.trim().toLowerCase())).filter(email => {
    if (options.exclude && options.exclude.includes(email)) {
      console.info(`Excluding ${email}`);
      return false;
    }

    // If for some reason the sender sends an email to the group and cc the group as well,
    // we ignore this user error
    if (email.substr(email.indexOf('@') + 1) === env.DOMAIN) {
      const { groupSlug } = parseEmailAddress(email);
      if (to.substr(0, to.indexOf('@')) === groupSlug) {
        console.info(`Skipping ${email} because it's the same inbox than ${to}`);
        return false;
      }
    }
    return true;
  });
  debug('Preparing', template, 'email to', to, 'cc', cc);
  if (process.env.DEBUG && process.env.DEBUG.match(/data/)) {
    debug('with data', data);
  }

  const prepareEmailForRecipient = async function(recipientEmailAddr) {
    // we generate a unique unsubscribe url per recipient
    if (get(data, 'unsubscribe.data')) {
      data.unsubscribe.url = await libemail.generateUnsubscribeUrl(recipientEmailAddr, data.unsubscribe.data);
    }
    if (get(data, 'subscribe.data')) {
      data.subscribe.url = await libemail.generateSubscribeUrl(recipientEmailAddr, data.subscribe.data);
    }
    return render(template, data);
  };

  const sendEmailWithIndividualUnsubscribeUrl = async function(to, cc, email) {
    const { subject, text, html } = await prepareEmailForRecipient(email);
    const emailOpts = {
      ...options,
      template,
      cc,
    };
    return libemail.send(to, subject, text, html, emailOpts);
  };

  // note: the goal here is to send an email to the group email and sending in cc to each recipient
  // with each their own unsubscribe one click link despite the fact that we are sending to the group email
  if (cc.length > 0) {
    return await Promise.all(
      cc.map(async ccEmail => await sendEmailWithIndividualUnsubscribeUrl(to, ccEmail, ccEmail)),
    );
  } else {
    return await sendEmailWithIndividualUnsubscribeUrl(to, null, to);
  }
};

libemail.send = async function(to, subject, text, html, options = {}) {
  if (!to || !to.match(/[^@]+@.+\..+/)) {
    console.warn(`libemail.send: invalid to email address: ${to}, skipping`);
    return;
  }
  if (options.exclude && options.exclude.includes(to)) {
    console.info(`libemail.send: excluding ${to}`);
    return;
  }
  let transport;
  if (process.env.MAILDEV) {
    transport = {
      ignoreTLS: true,
      port: 1025,
    };
  } else if (env.MAILGUN_PASSWORD) {
    transport = {
      service: 'Mailgun',
      auth: {
        user: env.MAILGUN_USER,
        pass: env.MAILGUN_PASSWORD,
      },
    };
  }

  if (process.env.DEBUG && process.env.DEBUG.match(/email/)) {
    const recipientSlug = to.substr(0, to.indexOf('@'));
    const filepath = path.resolve(`/tmp/${options.template}.${recipientSlug}.html`);
    fs.writeFileSync(filepath, html);
    debug('preview:', filepath);
  }
  if (!transport) {
    console.warn('lib/email: please configure mailgun or run a local test mail server (see README).');
    return;
  }

  const mailgun = nodemailer.createTransport(transport);

  const from = options.from || env.FROM_EMAIL;
  const cc = options.cc;
  const bcc = options.bcc;
  const attachments = options.attachments;

  // only attach tag in production to keep data clean
  const tag = env.NODE_ENV === 'production' ? options.tag : 'internal';
  const headers = { 'X-Mailgun-Tag': tag, 'X-Mailgun-Dkim': 'yes', ...options.headers };
  debug('send from:', from, 'to:', to, 'cc:', cc, JSON.stringify(headers));
  return await mailgun.sendMail({
    from,
    cc,
    to,
    bcc,
    subject,
    text,
    html,
    headers,
    attachments,
  });
};

export default libemail;
