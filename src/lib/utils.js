import { get } from 'lodash';

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
 * Respects RFC https://tools.ietf.org/html/rfc6068#section-6.1
 * @param {*} to
 * @param {*} subject
 * @param {*} body
 */
export const mailto = (to, action, subject = '', body = '') => {
  const iOS = process.browser && !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  // let email = to.indexOf('@') === -1 ? `${to}@${domain}` : to;
  let email = to;
  if (action) {
    email = email.replace('@', `/${action}@`);
  }
  let encodedBody = encodeURIComponent(body).replace(/%0A/g, '%0D%0A'); // proper RFC recommendation but ignored by gmail on iOS
  if (iOS) {
    encodedBody = encodedBody.replace(/%20%20/g, '%26nbsp%3B%26nbsp%3B'); // iOS Mail App considers the body as HTML
  }
  return `mailto:${email.replace('/', '%2F')}?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
};

/**
 * Trim long displayUrls
 */
export const keepAnchorsShort = (html, maxLength = 44) => {
  return html.replace(
    /(<a href=(?:'|")?([^( |"|'|>))]+)(?:'|")?[^>]*>)((?:(?!<\/?a).)+)<\/a>/gm,
    (match, tag, url, displayUrl) => {
      if (displayUrl.length > maxLength && displayUrl.match(/^(https?:\/\/|www\.)/)) {
        return `<a href="${url}">${displayUrl.replace(/^https?:\/\/(www\.)?/i, '').substr(0, maxLength - 1)}…</a>`;
      }
      return match;
    },
  );
};

export const getEnvVar = v =>
  process.browser ? get(window, ['__NEXT_DATA__', 'runTimeConfig', v]) : get(process, ['env', v]);

export const loadScriptAsync = (url, opts = {}) =>
  new Promise((resolve, reject) => {
    loadScript(url, opts, (err, script) => {
      if (err) {
        reject(err);
      } else {
        resolve(script);
      }
    });
  });
