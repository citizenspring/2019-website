import { get } from 'lodash';
import loadScript from 'load-script';

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
export const mailto = (to, action, subject = '', body = '', tags = []) => {
  const iOS = process.browser && !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  // let email = to.indexOf('@') === -1 ? `${to}@${domain}` : to;
  let email = to;
  if (tags && tags.length > 0) {
    subject += ` #${tags.join(' #')}`;
  }
  if (action) {
    email = email.replace('@', `/${action}@`);
  }
  let encodedBody = encodeURIComponent(body || '');
  // replace(/%0A/g, '%0A'); // proper RFC recommendation but ignored by gmail on iOS. Brave adds double new lines :-/
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

export const getEnvVar = v => {
  return process.browser ? get(window, ['__NEXT_DATA__', 'runtimeConfig', v]) : get(process, ['env', v]);
};

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

// source: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function extractHostname(url) {
  let hostname;
  // find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  // find & remove port number
  hostname = hostname.split(':')[0];
  // find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}

export function getDomain(url = '') {
  let domain = extractHostname(url);
  const splitArr = domain.split('.'),
    arrLen = splitArr.length;

  // extracting the root domain here
  // if there is a subdomain
  if (arrLen > 2) {
    domain = `${splitArr[arrLen - 2]}.${splitArr[arrLen - 1]}`;
    // check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
    if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
      // this is using a ccTLD
      domain = `${splitArr[arrLen - 3]}.${domain}`;
    }
  }
  return domain;
}
