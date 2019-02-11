import config from 'config';
import { verifyJwt } from '../lib/auth';
import { get } from 'lodash';
import request from 'request-promise';
import { extractNamesAndEmailsFromString, pluralize, capitalize } from '../lib/utils';
import models from '../models';
import { db } from '../lib/jest';
import { handleIncomingEmail } from './emails';
import mockedData from '../mocks/mailgun.email3.retrieved.json';
import debugLib from 'debug';
const debug = debugLib('api');

export const retrieveEmail = async ({ mailServer, messageId }) => {
  if (process.env.NODE_ENV === 'test') {
    console.log('>>> api.retrieveEmail> test environment, returning mocked data');
    return mockedData;
  }
  debug('retrieveEmail', mailServer, messageId);
  const requestOptions = {
    json: true,
    auth: {
      user: 'api',
      pass: get(config, 'email.mailgun.apiKey'),
    },
  };
  const url = `https://${mailServer}.api.mailgun.net/v3/domains/${get(config, 'server.domain')}/messages/${messageId}`;
  const email = await request.get(url, requestOptions);
  debug('retrieveEmail', 'email retrieved', JSON.stringify(email));
  return email;
};

/**
 * Publish an email to the group that is stored on the mail server
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function publishEmail(req, res, next) {
  const { groupSlug } = req.query;
  let token;
  try {
    token = verifyJwt(req.query.token);
  } catch (e) {
    if (e && e.name === 'TokenExpiredError') {
      return next(
        new Error(`The token has expired. Please resend your email to ${groupSlug}@${get(config, 'server.domain')}`),
      );
    }
  }
  let email, redirect;
  try {
    email = await retrieveEmail(token);
  } catch (e) {
    if (e.statusCode === 404) {
      return res.status(404).send('Email not found');
    } else {
      console.error('>>> retrieveEmail error', token, 'response:', JSON.stringify(e));
      return res.send('Unknown error');
    }
  }

  const userData = extractNamesAndEmailsFromString(email.From)[0];
  const user = await models.User.findOrCreate(userData);

  try {
    redirect = await handleIncomingEmail(email);
    debug('publishEmail: redirecting to', redirect);
    return res.redirect(redirect);
  } catch (e) {
    // console.error('>>> handleIncomingEmail error', JSON.stringify(email), 'response:', JSON.stringify(e));
    throw e;
    return res.send(`Error: ${e.message}`);
  }
}

/**
 * Approves an edit to a Group or to a Post
 * Expects a req.query.token with data { type: 'post' or 'group', TargetId, always: Boolean }
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function approve(req, res, next) {
  let token;
  try {
    token = verifyJwt(req.query.token);
  } catch (e) {
    if (e && e.name === 'TokenExpiredError') {
      return res.status(500).send(`The token has expired.`);
    }
  }
  const TargetId = get(token, 'data.TargetId');
  if (!TargetId) {
    return res.status(500).send(`Invalid token: TargetId missing`);
  }
  const target = await models[capitalize(get(token, 'data.type'))].findByPk(TargetId);
  if (!target) {
    return res.status(500).send(`Cannot approve: TargetId ${TargetId} not found`);
  }
  await target.publish();
  if (get(token, 'data.always') === true) {
    target.addAdmin(target.UserId);
  }
  if (get(token, 'data.includeChildren') === true) {
    const ParentColumn = `Parent${capitalize(get(token, 'data.type')).replace(/s$/, '')}Id`;
    const children = await models[capitalize(get(token, 'data.type'))].findAll({ where: { [ParentColumn]: TargetId } });
    children.map(async child => await child.publish());
  }
  const path = await target.getPath();
  return res.redirect(`${path}?action=${token.sub}`);
}

export async function follow(req, res, next) {
  let token;
  try {
    token = verifyJwt(req.query.token);
  } catch (e) {
    if (e && e.name === 'TokenExpiredError') {
      throw new Error(
        `The token has expired. Please resend your email to ${req.query.groupSlug}@${get(config, 'server.domain')}`,
      );
    }
  }
  let member = await models.Member.findOne({ where: token.data });
  if (member) {
    console.error(`api.follow: membership already exists`, member.id);
    return res.send(`It looks like you've already subscribed to those notifications`);
  }
  const users = await models.User.findAll({ attributes: ['id', 'email'] });
  member = await models.Member.create(token.data);
  let msg;
  if (member.PostId) {
    msg = `You have successfully subscribed to future updates to this thread`;
  } else {
    msg = `You have successfully subscribed to new messages sent to this group`;
  }
  return res.send(msg);
}

export async function unfollow(req, res, next) {
  let token;
  try {
    token = verifyJwt(req.query.token);
  } catch (e) {
    if (e && e.name === 'TokenExpiredError') {
      throw new Error(
        `The token has expired. Please resend your email to ${req.query.groupSlug}@${get(config, 'server.domain')}`,
      );
    }
  }
  const member = await models.Member.findByPk(token.data.MemberId);
  let msg;
  if (!member) {
    console.error(`api.unfollow: can't find Member.id`, token.data.MemberId);
    return res.send(`It looks like you've already unsubscribed from those notifications`);
  }
  if (member.PostId) {
    msg = `You have successfully unsubscribed from future updates to this thread`;
  } else {
    msg = `You have successfully unsubscribed from new messages sent to this group`;
  }
  await member.destroy();
  return res.send(msg);
}

export async function reset(req, res) {
  if (!req.query.secret || req.query.secret !== process.env.SECRET) {
    return res.send('invalid secret');
  }
  await db.reset();
  if (req.query.users) {
    const emails = req.query.users.split(',');
    await models.User.bulkCreate(
      emails.map(e => {
        return { email: e };
      }),
    );
    return res.send(`db reset and ${emails.length} ${pluralize(emails.length, 'user')} created (${emails.join(', ')})`);
  }
  return res.send('db reset');
}
