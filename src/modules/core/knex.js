import knex from 'knex';
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import bookshelf from 'bookshelf';
import cfg from '../../../config';

/**
 * Connect to mysql instance
 * @param {string} config
 * @return {Promise}
 */
function connect(config) {
  return bookshelf(knex(config));
}

const db = connect(cfg.knex);
db.plugin('pagination');
db.plugin('registry');

export default { db };
