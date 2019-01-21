import { get } from 'lodash';

let domain;
if (get(process, 'env.DOMAIN')) {
  domain = process.env.DOMAIN;
} else {
  const env = require('../env.frontend');
  domain = env.DOMAIN;
}

export const requireAttributes = (obj, attributes, getErrorMsg) => {
  attributes.map(attr => {
    if (!obj[attr]) {
      return new Error(getErrorMsg(attr));
    }
  });
  return true;
};

/**
 * Generate the mailto value for href
 * @param {*} to
 * @param {*} subject
 * @param {*} body
 */
export const mailto = (to, action, subject, body) => {
  let email = to.indexOf('@') === -1 ? `${to}@${domain}` : to;
  if (action) {
    email = email.replace('@', `/${action}@`);
  }
  return `mailto:${email.replace('/', '%2F')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
