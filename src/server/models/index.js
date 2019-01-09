/**
 * Dependencies.
 */
import pg from 'pg';
import Sequelize from 'sequelize';
import env from '../env';
import debug from 'debug';

// this is needed to prevent sequelize from converting integers to strings, when model definition isn't clear
// like in case of the key totalOrders and raw query (like User.getTopBackers())
pg.defaults.parseInt8 = true;

/**
 * Database connection.
 */
console.log(`Connecting to postgres://${env.PG_HOST}/${env.PG_DATABASE}`);

const options = {
  port: 5432,
  dialect: 'postgres',
  protocol: 'postgres',
  logging: true,
  pool: {
    min: 8,
    max: 18,
    acquire: 60000,
  },
  dialectOptions: {
    ssl: env.NODE_ENV === 'production',
  },
  benchmark: true,
  operatorsAliases: false,
};

// If we launch the process with DEBUG=psql, we log the postgres queries
if (env.DEBUG && env.DEBUG.match(/psql/)) {
  options.logging = true;
}

if (options.logging) {
  if (env.NODE_ENV === 'production') {
    options.logging = (query, executionTime) => {
      if (executionTime > 50) {
        debug('psql')(query.replace(/(\n|\t| +)/g, ' ').slice(0, 100), '|', executionTime, 'ms');
      }
    };
  } else {
    options.logging = (query, executionTime) => {
      debug('psql')(
        '\n-------------------- <query> --------------------\n',
        query,
        `\n-------------------- </query executionTime="${executionTime}"> --------------------\n`,
      );
    };
  }
}

export const sequelize = new Sequelize(env.PG_DATABASE, env.PG_USERNAME, env.PG_PASSWORD, options);

/**
 * Separate function to be able to use in scripts
 */
export function setupModels(client) {
  const m = {}; // models

  /**
   * Models.
   */

  ['User', 'Group', 'Activity', 'Member', 'Post'].forEach(model => {
    m[model] = client.import(`${__dirname}/${model}`);
  });

  Object.keys(m).forEach(modelName => m[modelName].associate && m[modelName].associate(m));

  return m;
}

const models = setupModels(sequelize);
export default models;
export const Op = Sequelize.Op;
