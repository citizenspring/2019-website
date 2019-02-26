import debugLib from 'debug';
const debug = debugLib('email');
import { get, uniq, pick } from 'lodash';
import nodemailer from 'nodemailer';
import config from 'config';
import { parseEmailAddress, extractNamesAndEmailsFromString, getRecipientEmail } from '../lib/utils';
import { createJwt } from '../lib/auth';
import path from 'path';
import fs from 'fs';
import models from '../models';
import sanitizeHtml from 'sanitize-html';
import { render } from '../templates';
import markdown from './markdown';

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

  let res = html,
    matches;
  if (html.indexOf('gmail_signature') !== -1) {
    matches = html.match(/<div[^\>]+class="gmail_signature"/i);
    res = html.substr(0, matches.index);
    res = res.replace(/--+ *(<br( \/)?>)?$/, '') + '</body></html>';
    return res;
  }

  if (html.indexOf('composer_signature') !== -1) {
    matches = html.match(/<div[^\>]+id="composer_signature"/i);
    res = html.substr(0, matches.index);
    res = res.replace(/--+ *(<br( \/)?>)?$/, '') + '</body></html>';
    return res;
  }

  if (html.indexOf('id="AppleMailSignature"') !== -1) {
    matches = html.match(/<div[^\>]+id="AppleMailSignature"/i);
    res = html.substr(0, matches.index);
    res = res.replace(/(<br( \/)?>)*$/, '') + '</div></body></html>';
    return res;
  }

  return res;
};

libemail.getHTML = function(email) {
  let html = email['body-html'] || email['stripped-html'] || '';
  html = libemail.removeEmailResponse(html);
  html = libemail.removeEmailSignature(html);
  html = html.replace(/<head>.*<\/head>/i, '');
  html = html.replace(/(<\/?html>|<\/?head>|<\/?body[^>]*>)/g, '');

  // iPhone doesn't provide a correct html version of the email if there is no formatting
  // the email is wrapped within <p></p> and new lines are \r\n
  const trimmedHtml = html.substring(3, html.lastIndexOf('</p>')).trim();

  if (trimmedHtml === (email['body-plain'] || '').trim()) {
    html = trimmedHtml;
  }

  // Outlook
  if (html.indexOf('<!--StartFragment-->') !== -1) {
    html = html
      .substr(html.indexOf('<!--StartFragment-->') + 20)
      .replace(/\n/gm, ' ')
      .replace(/( |&nbsp;)+/gm, ' ')
      .replace(/<\/?b[^>]*>\s?(<\/?b[^>]*>\s?)+/g, '');
  }

  // Microsoft Word (yes, seriously)
  if (html.indexOf('urn:schemas-microsoft-com:office:word') !== -1) {
    html = html.substr(html.lastIndexOf('<![endif]-->') + 12);
    html = html.replace(/<o:p>([^<]*)<\/o:p>/gm, '<span>$1</span>');
    return html;
  }

  // Huawei phones
  if (email['stripped-signature']) {
    html = html.replace(email['stripped-signature'], '');
  }

  // Remove padding otherwise markdown consider it as <code> (e.g. Thunderbird)
  const matches = html.match(/^ +</gm);
  if (matches) {
    const paddings = [];
    matches.map(m => paddings.push(m.length - 1));
    const minPadding = Math.min.apply(null, paddings);
    html = html.replace(new RegExp(`^ {${minPadding}}`, 'gm'), '');
  }

  // convert <div><br></div> from gmail to new paragraphs
  if (html.indexOf('</div><div') > -1) {
    html = html
      .replace(/<div[^>]*>(<(b|i)>)?<br[^>]*>(<\/(b|i)>)?<\/div>/gm, '\r\n\r\n')
      .replace(/(<br[^>]*>)+/g, '\r\n\r\n')
      .replace(/<div[^>]*>((?:(?!<\/?div).)+)(<\/div>)?/gm, '<br>\r\n$1\r\n') // replace <div>$line</div> to $line<br>
      .replace(/^(\r)?\n<br>/gm, '\r\n')
      .replace(/(<div[^>]*>)+/gm, '')
      .replace(/(<\/div[^>]*>)+/gm, '')
      .replace(/\r\n(\r\n)+/g, '\r\n\r\n') // max 2 new empty lines
      .trim()
      .replace(/^<br[^>]*>(\r\n)?/, '') // remove leading <br>
      .replace(/(<br[^>]*>)+$/, ''); // remove trailing <br>
  }

  // Process markdown
  if (!html) {
    console.warn('html is empty for email', email);
    return '';
  }
  debug('>>> html pre sanitize', html);
  // we remove the <a data-*> from copy pastes from facebook
  html = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      a: ['href', 'name'],
      img: ['src'],
    },
  });
  debug('>>> html after sanitize', html);

  html = html
    // remove already linked urls (as they will be relinked with the markdown processor)
    .replace(/<a[\s][^>]*href="([^"]+)"[^>]*>\1<\/a>/gm, '$1')
    // convert <p></p> to double new lines since they will be converted back by markdown processor
    .replace(/<p[^>]*>((?:(?!<\/?p)(.|\n))*)(<\/p>)/gm, '\r\n$1\r\n')
    // convert <div></div> to new lines since they will be converted back by markdown processor
    .replace(/<div[^>]*>((?:(?!<\/?div)(.|\n))*)(<\/div>)/gm, '<br>\r\n$1\r\n')
    // remove wrapping <div></div>
    .replace(/(<div>)((.|\n|\r)*)(<\/div>)/gm, '$2')
    // remove wrapping <div></div>
    .replace(/(<div>)((.|\n|\r)*)(<\/div>)/gm, '$2')
    .replace(/(\r)?\n((\r)?\n)+/gm, '\r\n\r\n') // max 2 new lines in a row
    .replace(/\no /gm, '\n  - ') // handle lists level 2
    .replace(/\n&gt;/g, '\n>')
    .replace(/(<br[^>]*>)+(\r\n)*$/g, ''); // clean trailing new lines

  debug('>>> html pre markdown', html);

  html = markdown(html);
  debug('>>> html after markdown', html);

  // Remove trailing <p> and trailing <div dir=ltr><div><br clear=all></div></div> when removing signature from gmail
  html = html
    .replace(/(<(p|br[^>]*)>)+$/, '')
    .replace(/<(\/?)p><br>/g, '<$1p>')
    .replace(/<div[^>]*>(<br[^>]*>)*<\/div>/g, '')
    .replace(/<div[^>]*>(<br[^>]*>)*<\/div>/g, '');

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
 * note: we extract the group email from the list of recipients
 * @POST { sender: email, recipients: [{name, email}],  group: { slug, email, domain }, action, tags: [string], ParentPostId, PostId }
 */
libemail.parseHeaders = function(email) {
  if (!email.sender) {
    throw new Error('libemail.parseHeaders: invalid email object');
  }
  const sender = email.sender.toLowerCase();
  // note: we cannot use email.recipient since mailgun removes the /ThreadId/PostId as part of the recipient address
  const recipientEmail = getRecipientEmail(email);
  const parsedSenderEmail = parseEmailAddress(sender);
  const parsedRecipientEmail = parseEmailAddress(recipientEmail);
  let parsedGroupEmail = {};
  if (parsedRecipientEmail.domain === config.server.domain) {
    parsedGroupEmail = parsedRecipientEmail;
  }
  let recipients = extractNamesAndEmailsFromString(`${email.To}, ${email.Cc}`);
  recipients = recipients.filter(r => {
    if (!r.email) return false;
    const parsedEmail = parseEmailAddress(r.email);
    if (r.email === sender) return false;
    if (parsedEmail.domain === config.server.domain) {
      if (!parsedGroupEmail.email) {
        parsedGroupEmail = parsedEmail;
      }
      return false;
    }
    return true;
  });

  const res = {
    sender,
    recipients,
    ...pick(parsedGroupEmail, ['action', 'ParentPostId', 'PostId', 'tags']),
  };

  if (parsedGroupEmail.domain) {
    res.group = pick(parsedGroupEmail, ['email', 'domain']);
    res.group.slug = parsedGroupEmail.groupSlug;
  }
  return res;
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
    process.env.NODE_ENV !== 'test' &&
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
