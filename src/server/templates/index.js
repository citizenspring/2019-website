import { get } from 'lodash';
import config from 'config';
import React from 'react';
import Oy from 'oy-vey';

import * as shortcode from './shortcode.email.js';
import * as confirmEmail from './confirmEmail.email.js';
import * as confirmJoinGroup from './confirmJoinGroup.email.js';
import * as followGroup from './followGroup.email.js';
import * as followThread from './followThread.email.js';
import * as groupCreated from './groupCreated.email.js';
import * as groupInfo from './groupInfo.email.js';
import * as threadCreated from './threadCreated.email.js';
import * as post from './post.email.js';

const templates = {
  shortcode,
  confirmEmail,
  confirmJoinGroup,
  followGroup,
  followThread,
  threadCreated,
  post,
  groupCreated,
  groupInfo,
};

export default templates;

const generateCustomTemplate = (options, data) => {
  let previewText = '';
  if (options.previewText) {
    previewText = `<span style="display:none;color:#FFFFFF;margin:0;padding:0;font-size:1px;line-height:1px;">
      ${options.previewText}
    </span>`;
  }

  return `
    <!doctype html>
    <html style="margin:0;padding:0">
      <head>
        <title>${options.title}</title>
      </head>
      <body style="margin:0;padding:0">
      ${previewText}
      ${options.bodyContent}
      </body>
    </html>
  `;
};

/**
 * Returns { subject, text, html }
 */
export const render = (template, data) => {
  if (!templates[template]) {
    throw new Error(`Template ${template} not found`);
  }
  const subject = templates[template].subject(data);
  const previewText = templates[template].previewText && templates[template].previewText(data);
  const templateComponent = React.createElement(templates[template].body, data);
  const html = Oy.renderTemplate(templateComponent, { title: subject, previewText }, opts =>
    generateCustomTemplate(opts, data),
  );
  const text = templates[template].text && templates[template].text(data);
  return { subject, text, html };
};
