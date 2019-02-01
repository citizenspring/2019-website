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
  const locale = accept.language(languages) || 'en';
  logger.debug('url %s locale %s', req.url, locale);
  req.locale = locale;
  req.localeDataScript = getLocaleDataScript(locale);
  req.messages = getMessages(locale);
  // req.messages = dev ? {} : getMessages(locale)
  next();
});

routes(server);

nextApp.prepare().then(() => {
  server.get('*', pagesHandler);
  server.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
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
  server.listen(port, err => {
    if (err) {
      throw err;
    }
    logger.info(`> NODE_ENV: ${process.env.NODE_ENV} - DEBUG: ${process.env.DEBUG}`);
    logger.info(
      `> Connecting to pgsql://${config.server.database.options.host}:${config.server.database.port || 5432}/${
        config.server.database.database
      }`,
    );
    logger.info(`> GraphQL server ready on http://localhost:${port}/graphql/v1`);
    logger.info(`> Web server ready on http://localhost:${port}`);
  });
});

export default server;
