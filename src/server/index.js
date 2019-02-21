import '../env';
import config from 'config';
import path from 'path';

import express from 'express';
import next from 'next';
import { get } from 'lodash';
import logger from '../logger';
import accepts from 'accepts';
import { getLocaleDataScript, getMessages, languages } from './intl';

const { PORT } = process.env;

const port = parseInt(PORT, 10) || 3000;
import routes from './routes';
import pages from './pages';
// jest.setup.js
import { nextConfig } from '../next.config';

const nextApp = next({
  dir: path.dirname(__dirname),
  dev: process.env.NODE_ENV !== 'production',
  conf: nextConfig,
});
const pagesHandler = pages.getRequestHandler(nextApp);

const server = express();
server.use((req, res, next) => {
  const accept = accepts(req);
  // Detect language as query string in the URL
  if (req.query.language && languages.includes(req.query.language)) {
    req.language = req.query.language;
  }
  const locale = req.language || accept.language(languages) || 'en';
  logger.debug('url %s locale %s', req.url, locale);
  req.locale = locale;
  req.localeDataScript = getLocaleDataScript(locale);
  req.messages = getMessages(locale);
  // req.messages = dev ? {} : getMessages(locale)
  next();
});

routes(server);

server.get('*', pagesHandler);
server.use((err, req, res, next) => {
  if (!['production', 'test'].includes(process.env.NODE_ENV)) {
    console.error(err.stack);
  }
  return res.status(500).send(
    `<html>
        <head>
          <title>Error</title>
        </head>
        <body style="font-family: Helvetica Neue, Helvetica, Sans Serif;">
          <p>Oh no! Something broke! ¯\\_(ツ)_/¯ </p>
          <p>${err.message}</p>
        </body>
      </html>`,
  );
});

process.env.NODE_ENV !== 'test' &&
  nextApp.prepare().then(() => {
    server.listen(port, err => {
      if (err) {
        throw err;
      }
      const host = process.env.NOW_URL || 'http://localhost';
      logger.info(`> NODE_ENV: ${process.env.NODE_ENV} - DEBUG: ${process.env.DEBUG}`);
      logger.info(
        `> Connecting to pgsql://${config.server.database.options.host}:${config.server.database.port || 5432}/${
          config.server.database.database
        }`,
      );
      logger.info(`> GraphQL server ready on ${host}:${port}/graphql/v1`);
      logger.info(`> Web server ready on ${host}:${port}`);
    });
  });

server.nextApp = nextApp;
export default server;
