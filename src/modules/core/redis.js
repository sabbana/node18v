import Promise from 'bluebird';
import redis from 'redis';
import _ from 'lodash';
import redisDeleteWildcard from 'redis-delete-wildcard';
import { redis as redisConfig, jwt } from '../../../config';

Promise.promisifyAll(redis);
redisDeleteWildcard(redis);

const {
  host, port, prefix, enable, password,
} = redisConfig;

export const client = redis.createClient({
  host,
  port,
  prefix,
  password,
});

export function cacheSet(key, value, expired = null, database = 0) {
  if (!enable) return;
  client.select(database);
  if (expired) client.set(key, JSON.stringify(value), 'EX', expired);
  if (!expired) client.set(key, JSON.stringify(value));
}

export function tokenSet(token, value, type) {
  let authPrefix = '';
  if (type === 'access_token') authPrefix = jwt.prefix_access_token;
  if (type === 'refresh_token') authPrefix = jwt.prefix_refresh_token;
  client.hset(`${authPrefix}${token}`, 'token', JSON.stringify(value));
  client.expire(`${authPrefix}${token}`, jwt.expiresIn);
}

export function tokenRename(oldToken, newToken, type) {
  let authPrefix = '';
  if (type === 'access_token') authPrefix = jwt.prefix_access_token;
  if (type === 'refresh_token') authPrefix = jwt.prefix_refresh_token;
  client.rename(`${authPrefix}${oldToken}`, `${authPrefix}${newToken}`);
  client.expire(`${authPrefix}${newToken}`, jwt.expiresIn);
}

export async function tokenGetAll(token, type) {
  let authPrefix = '';
  if (type === 'access_token') authPrefix = jwt.prefix_access_token;
  if (type === 'refresh_token') authPrefix = jwt.prefix_refresh_token;
  const data = await client.hgetallAsync(`${authPrefix}${token}`);
  return _.mapValues(data, (d) => JSON.parse(d));
}

export async function tokenGet(token, type, field) {
  let authPrefix = '';
  if (type === 'access_token') authPrefix = jwt.prefix_access_token;
  if (type === 'refresh_token') authPrefix = jwt.prefix_refresh_token;
  const data = await client.hgetAsync(`${authPrefix}${token}`, field);
  if (data) return JSON.parse(data);
  return null;
}

export async function tokenDelete(token, type) {
  let authPrefix = '';
  if (type === 'access_token') authPrefix = jwt.prefix_access_token;
  if (type === 'refresh_token') authPrefix = jwt.prefix_refresh_token;
  return client.delAsync(`${authPrefix}${token}`);
}

export function profileSet(token, value) {
  client.hset(`${jwt.prefix_refresh_token}${token}`, 'profile', JSON.stringify(value));
  client.expire(`${jwt.prefix_refresh_token}${token}`, jwt.expiresIn);
}

export function profileGet(token) {
  client.hget(`${jwt.prefix_refresh_token}${token}`, 'token');
}

export async function cacheGet(key, database = 0) {
  client.select(database);
  const cache = await client.getAsync(key);
  return JSON.parse(cache);
}

export function cacheDel(key, database = 0) {
  client.select(database);
  return client.del(key);
}

export function cacheSetNotEx(key, value, database = 0) {
  client.select(database);
  client.set(key, value);
}

export function cacheFlush(database = 0) {
  client.select(database);
  return client.flushdb();
}

export async function cacheDelPattern(pattern, database = 0) {
  return new Promise((resolve, reject) => {
    client.select(database);
    client.delwild(prefix + pattern, (err, count) => {
      if (err) return reject(err);

      return resolve(count);
    });
  });
}

export async function getKeys(pattern, database = 0) {
  client.select(database);
  return client.keysAsync(pattern);
}
