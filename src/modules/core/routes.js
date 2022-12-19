import express from 'express';
import apicache from 'apicache';
import { getKeys } from './redis';

const routes = express.Router();

routes.get('/status', (req, res) => res.status(200).json({ status: 'ok' }));
routes.get('/api/cache/clear/:target?', (req, res) => {
  res.json(apicache.clear(req.params.target));
});
routes.get('/api/cache/index', (req, res) => {
  res.json(apicache.getIndex());
});
routes.get('/api/redis/index', async (req, res) => {
  const keys = await getKeys('noice:*');
  res.json(keys);
});
routes.get('/api/cache/:collection/:item?', (req, res) => {
  req.apicacheGroup = req.params.collection;
  res.json({ success: true });
});
routes.get('/favicon.ico', (req, res) => res.status(204));

export default routes;
