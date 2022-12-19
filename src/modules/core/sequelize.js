import { Sequelize } from 'sequelize';
import cfg from '../../../config';

/**
 * Connect to mysql instance
 * @param {string} config
 * @return {Promise}
 */
function connect(config) {
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: config.debug,
    port: config.port,
    timezone: 'Asia/Jakarta',
    pool: config.pool,
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionAcquireTimeoutError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
      timeout: 10000,
      max: 3,
    },
  });
  return sequelize;
}

const db = connect(cfg.sequelize);

export { db };
export default { db };
