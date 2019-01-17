if (['circleci', 'test', 'development'].includes(process.env.NODE_ENV)) {
  const dbname = `citizenspring-test-${Math.round(Math.random() * 1000000)}`;
  process.env.PG_DATABASE = dbname;
  console.log('> creating db', process.env.PG_DATABASE);
  execSync(`createdb ${dbname}`);
}

import { graphql } from 'graphql';
import schema from '../graphql/schema';
import debug from 'debug';
import { sequelize } from '../models';
import config from 'config';
import { execSync } from 'child_process';

export const db = {
  reset: async () => {
    try {
      await sequelize.sync({ force: true });
      console.log(`> ${config.server.database.database} db reset`);
      return true;
    } catch (e) {
      console.error(
        `lib/jest.js> cannot reset ${config.server.database.database} db in ${process.env.NODE_ENV} env.`,
        e,
      );
      process.exit(0);
    }
  },
  close: () => {
    console.log(`> dropping ${dbname}`);
    execSync(`dropdb ${dbname}`);
    sequelize.close();
  },
};

export const graphqlQuery = async (query, variables, remoteUser) => {
  debug('graphql')('query', query);
  debug('graphql')('variables', variables);
  debug('graphql')('context', remoteUser);

  return graphql(
    schema,
    query,
    null, // rootValue
    constructRequestObject(remoteUser, query), // context
    variables,
  );
};

export const constructRequestObject = (remoteUser, query) => {
  return {
    remoteUser,
    body: { query },
    loaders: {},
  };
};

export const inspectSpy = (spy, argsCount) => {
  for (let i = 0; i < spy.callCount; i++) {
    console.log(`>>> spy.args[${i}]`, { ...spy.args[i].slice(0, argsCount) });
  }
};

/**
 * Wait for condition to be met
 * E.g. await waitForCondition(() => emailSendMessageSpy.callCount === 1)
 * @param {*} cond
 * @param {*} options: { timeout, delay }
 */
export const waitForCondition = (cond, options = { timeout: 10000, delay: 0 }) =>
  new Promise(resolve => {
    let hasConditionBeenMet = false;
    setTimeout(() => {
      if (hasConditionBeenMet) return;
      console.log('>>> waitForCondition Timeout Error');
      console.trace();
      throw new Error('Timeout waiting for condition', cond);
    }, options.timeout || 10000);
    const isConditionMet = () => {
      hasConditionBeenMet = Boolean(cond());
      if (options.tag) {
        console.log(new Date().getTime(), '>>> ', options.tag, 'is condition met?', hasConditionBeenMet);
      }
      if (hasConditionBeenMet) {
        return setTimeout(resolve, options.delay || 0);
      } else {
        return setTimeout(isConditionMet, options.step || 100);
      }
    };
    isConditionMet();
  });
