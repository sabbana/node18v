import config from './index';

const cfg = {};
cfg[config.env] = config.sequelize;

module.exports = cfg;
