import mongoose from 'mongoose';
import debug from 'debug';
import util from 'util';
import chalk from 'chalk';
import Promise from 'bluebird';
import cfg from '../../../config';

// replace mpromise with javascript's native promise library
mongoose.Promise = Promise;
cfg.mongodb.options.promiseLibrary = Promise;

/**
 * Create logger for mongodb
 * @type {function}
 */
const logger = debug('mongodb');

/**
 * Log mongodb query when debugging mode is on
 * @param {boolean} enable
 */
function enableDebugging(enable = true) {
  if (enable) {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`${collectionName}.${method}`, util.inspect(query, false, 20), doc));
      logger(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
    });
  } else {
    mongoose.set('debug', () => { });
  }
}

/**
 * Connect to mongodb instance
 * @param {string} dsn
 * @param {Object} options
 * @param {boolean} log
 * @return {Promise}
 */
// function connect(dsn, options = {}, log = false) {
//   return new Promise((resolve, reject) => {
//     const conn = mongoose.connect(dsn, options)
//       .then(() => {
//         enableDebugging(log);
//         resolve(conn);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// }

export function connectLog(log = true) {
  const dsn = cfg.mongodb.logUrl;
  const { options } = cfg.mongodb;
  mongoose.logConn = mongoose.createConnection(dsn, options);
  enableDebugging(log);
  return mongoose.logConn;
}

export default {
  // connect,
  connectLog,
  mongoose,
};
