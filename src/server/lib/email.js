import debugLib from 'debug';
const debug = debugLib('email');
import { get, uniq } from 'lodash';
import nodemailer from 'nodemailer';
import config from 'config';
import { parseEmailAddress, extractNamesAndEmailsFromString } from '../lib/utils';
import { createJwt } from '../lib/auth';
import path from 'path';
import fs from 'fs';
import models from '../models';

import { render } from '../templates';

const libemail = {};

console.log(`> Using mailgun account ${get(config, 'email.mailgun.user')}`);

/**
 * Remove the quoted email
 */
libemail.removeEmailResponse = function(html) {
  if (!html || typeof html !== 'string') throw new Error('libemail.removeEmailResponse error: html should be a string');

  if (html.indexOf('gmail_quote') === -1) return html;

  return html.substr(0, html.indexOf('<div class="gmail_quote"')) + '</body></html>';
};

libemail.removeEmailSignature = function(html) {
  if (!html || typeof html !== 'string')
    throw new Error('libemail.removeEmailSignature error: html should be a string');

  let res = html;
  if (html.indexOf('gmail_signature') !== -1) {
    res = html.substr(0, html.indexOf('<div class="gmail_signature"'));
    res = res.replace(/--+ *(<br( \/)?>)?$/, '') + '</body></html>';
  }

  if (html.indexOf('id="AppleMailSignature"') !== -1) {
    res = html.substr(0, html.indexOf('<div id="AppleMailSignature"'));
    res = res.replace(/(<br( \/)?>)*$/, '') + '</body></html>';
  }
  return res;
};

libemail.getHTML = function(email) {
  let html = email['stripped-html'];
  html = libemail.removeEmailResponse(html);
  html = libemail.removeEmailSignature(html);
  html = html.replace(/<head>.*<\/head>/i, '');
  html = html.replace(/(<\/?html>|<\/?head>|<\/?body[^>]*>)/g, '');
  // iPhone doesn't provide a correct html version of the email if there is no formatting
  // the email is wrapped within <p></p> and new lines are \r\n
  const trimmedHtml = html.substring(3, html.lastIndexOf('</p>')).trim();
  if (trimmedHtml === (email['body-plain'] || '').trim()) {
    const paragraphs = trimmedHtml.split('\r\n\r\n');
    html = '<p>' + paragraphs.join('</p>\n\n<p>') + '</p>\n';
    const newlines = html.split('\r\n');
    html = newlines.join('<br />\n');
  }

  // convert <div><br></div> to new paragraphs
  if (html.indexOf('</div><div>') > -1) {
    html =
      '<p>' +
      html
        .split('</div><div>')
        .map(l => l.replace(/(<div( [a-z]+=[^ ]+)?>|<\/div>)/g, '').trim())
        .filter(l => !l.match(/^(<[a-z]+>)*(<br( \/| clear="[a-z]+")?>)+(<\/[a-z]+>)*$/)) // we remove empty paragraphs <div>(<br>)+</div>, <div><b><br /></b></div>
        .join('</p><p>')
        .trim() +
      '</p>';
    html = html.replace(/(<div( [a-z]+=[^ ]+)?>|<\/div>)/g, '').trim();
  }
  return html;
};

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
  return `${config.server.baseUrl}/api/unfollow?token=${token}`;
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
  return `${config.server.baseUrl}/api/follow?token=${token}`;
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
  let parsedGroupEmail = {};
  if (parsedRecipientEmail.domain === config.server.domain) {
    parsedGroupEmail = parsedRecipientEmail;
  }
  const recipients = extractNamesAndEmailsFromString(`${email.To}, ${email.Cc}`).filter(r => {
    if (!r.email) return false;
    if (r.email === recipient) return false;
    const parsedEmail = parseEmailAddress(r.email);
    if (parsedEmail.email === parsedRecipientEmail.email) return false;
    if (parsedEmail.email === parsedSenderEmail.email) return false;
    if (!parsedGroupEmail.email && parsedEmail.domain === config.server.domain) {
      parsedGroupEmail = parsedEmail;
      return false;
    }
    return true;
  });
  return { sender, ...parsedGroupEmail, recipients };
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
    if (email.substr(email.indexOf('@') + 1) === get(config, 'server.domain')) {
      const { groupSlug } = parseEmailAddress(email);
      if (to.substr(0, to.indexOf('@')) === groupSlug) {
        console.info(`Skipping ${email} because it's the same inbox than ${to}`);
        return false;
      }
    }
    return true;
  });
  if (template === 'post' && cc.length === 0) {
    console.warn('libemail.sendTemplate> template is', template, 'and cc is empty, skipping send email');
    return;
  }
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
  } else if (get(config, 'email.mailgun.password')) {
    transport = {
      service: 'Mailgun',
      auth: {
        user: get(config, 'email.mailgun.user'),
        pass: get(config, 'email.mailgun.password'),
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

  const from = options.from || config.email.from;
  const cc = options.cc;
  const bcc = options.bcc;
  const attachments = options.attachments;

  // only attach tag in production to keep data clean
  const tag = config.env === 'production' ? options.tag : 'internal';
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

export const quoteEmail = ({ html, text }, format = 'text') => {
  switch (format) {
    case 'text':
      return text ? `> ${text.split('\n').join('\n> ')}` : '';
    case 'html':
      return (
        <div>
          <hr />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
  }
};

export default libemail;
