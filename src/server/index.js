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

nextApp.prepare().then(() => {
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
  server.get('*', pagesHandler);
  server.listen(port, err => {
    if (err) {
      throw err;
    }
    logger.info(
      `> Connecting to pgsql://${config.server.database.options.host}:${config.server.database.port || 5432}/${
        config.server.database.database
      }`,
    );
    logger.info(`> GraphQL server ready on http://localhost:${port}/graphql/v1`);
    logger.info(`> Web server ready on http://localhost:${port}`);
  });
});
