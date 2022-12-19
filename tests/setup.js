/* eslint-disable no-undef */
// import knex from 'knex';
import 'babel-polyfill';
// import config from '../config';

// TODO: change to sequelize migration
// const db = knex(config.knex);

describe('init sqlite database', () => {
  beforeAll(async (done) => {
    // if (config.knex.client === 'sqlite3') {
    //   console.log('rollback database sqlite3');
    //   await db.migrate.rollback();
    //   console.log('migrating database sqlite3');
    //   await db.migrate.latest();
    //   await db.seed.run();
    // }
    done();
  });
  it('init db', () => {
    expect(true).toBe(true);
  });
});
