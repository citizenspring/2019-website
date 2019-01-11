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
export const mailto = (to, subject, body) => {
  return `mailto:${to.replace('/', '%2F')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
