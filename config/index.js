const path = require('path');
const cfg = require('../common/config');

const def = {};

// setup default env
def.env = process.env.NODE_ENV || 'development';
process.env.NODE_ENV = def.env;

def.debug = true;
def.https = false;
def.host = 'localhost';
def.apiHost = 'localhost';
def.shareHost = 'localhost';
def.port = 4000;

// sequelize config
def.sequelize = {};
def.sequelize.debug = console.log;
def.sequelize.username = 'root';
def.sequelize.password = 'basmallah';
def.sequelize.database = 'sapoe';
def.sequelize.host = '127.0.0.1';
def.sequelize.port = 3306;
def.sequelize.dialect = 'mysql';

def.loginPath = '/login';
def.secret = 'inspira';

// mongoDB
def.mongodb = {};
def.mongodb.logUrl = 'mongodb://localhost/sapoelog'
def.mongodb.options = {
  promiseLibrary: Promise,
};

// paths
const rootDir = path.dirname(__dirname);
def.publicPath = path.join(rootDir, 'public');
def.cachePath = path.join(rootDir, 'cache');
def.tempPath = path.join(rootDir, 'temp');
def.imagePath = path.join(rootDir, 'public/image');
def.dataPath = path.join(rootDir, 'public/data');
def.logPath = path.join(rootDir, 'logs');
def.geolitedbPath = path.join(rootDir, 'geolitedb');

def.redis = {};
def.redis.host = '127.0.0.1';
def.redis.port = 6379;
def.redis.prefix = 'sapoe:';
def.redis.enable = true;
def.redis.password = '';

// jwt config
def.jwt = {};
def.jwt.secretOrKey = 'MY-APP';
def.jwt.issuer = 'sapoe.com';
def.jwt.audience = 'sapoe.com';
def.jwt.prefix_refresh_token = 'refresh_token:';
def.jwt.prefix_access_token = 'access_token:';
def.jwt.expiresIn = 360000;

def.web = {};
def.web.host = 'http://dev-cms.sapoe.id';
def.web.resetPasswordPage = '/reset';

def.ttl = {};
def.ttl.tokens = {
  activation: 86400, // 24h
  forgotPassword: 86400, // 24h
};

// crypto config
def.crypto = {};
def.crypto.secret = 'web.sapoe';

// mailer config
def.emailServiceAdapter = 'sendgrid';

// sentry config
def.sentry = {};
def.sentry.enable = false;
def.sentry.dsn = '';

// newrelic config
def.newrelic = {};
def.newrelic.enable = false;
def.newrelic.key = '';
def.newrelic.name = 'Project';

// url builder
def.url = (dir = '/') => {
  const port = ((def.https && def.port !== 443) || (!def.https && def.port !== 80)) ? `:${def.port}` : '';
  return `http${def.https ? 's' : ''}://${def.host}${port}${dir}`;
};

def.apiUrl = (dir = '/') => {
  const port = ((def.https && def.port !== 443) || (!def.https && def.port !== 80)) ? `:${def.port}` : '';
  return `http${def.https ? 's' : ''}://${def.apiHost}${port}${dir}`;
};

def.imageUrl = (dir = '/') => {
  const port = ((def.https && def.port !== 443) || (!def.https && def.port !== 80)) ? `:${def.port}` : '';
  return `http${def.https ? 's' : ''}://${def.host}${port}/image${dir}`;
};

def.dataUrl = (dir = '/') => {
  const port = ((def.https && def.port !== 443) || (!def.https && def.port !== 80)) ? `:${def.port}` : '';
  return `http${def.https ? 's' : ''}://${def.host}${port}/data${dir}`;
};

// sendgrid config
def.sendgrid = {};
def.sendgrid.fromEmail = 'noreply@sapoe.com';
def.sendgrid.apiKey = '';
def.sendgrid.params = {};

def.cron = {};
def.cron.enable = true;

def.twilio = {};
def.twilio.apiKey = '';

def.fcm = {};
def.fcm.key = '';
def.fcm.topic = 'sapoe-all';
def.fcm.prefix = 'dev-';
def.fcm.urlApi = 'https://iid.googleapis.com/iid';

def.flood = {};
def.flood.attempt = 3;
def.flood.duration = 1;

def.OSS = {};
def.OSS.region = 'oss-ap-southeast-5';
def.OSS.accessKey = 'LTAI4GDFpsEbBKBbbjxR6ZN9';
def.OSS.secretKey = '7GqPGjC3EZe4Lz2NueFvZw4gJ9ELcj';
def.OSS.bucketName = 'sapoe-dev';
def.OSS.content = 'https://sapoe-dev.oss-ap-southeast-5.aliyuncs.com';

def.S3 = {};
def.S3.region = '';
def.S3.accessKey = '';
def.S3.secretKey = '';
def.S3.bucketName = '';
def.S3.content = '';
def.S3.expires = '1800';

def.ses = {};
def.ses.fromEmail = 'noreply@noice.id';
def.ses.serverName = 'email-smtp.ap-southeast-1.amazonaws.com';
def.ses.region = 'ap-southeast-1';
def.ses.accessKey = '';
def.ses.secretKey = '';
def.ses.port = '587';

def.aws = {};
def.aws.region = '';
def.aws.accessKey = def.S3.accessKey;
def.aws.secretKey = def.S3.secretKey;
def.aws.encryptedKey = '';
def.aws.encryptedMD5 = '';
def.aws.encryptedIV = '';

def.localImage = {};
def.localImage.imagePath = def.imagePath;
def.localImage.imageUrl = def.imageUrl;

def.imageServiceAdapter = 'local';

def.appRedirect = {};
def.appRedirect.appStore = 'https://apps.apple.com/';
def.appRedirect.playStore = 'https://play.google.com/';

cfg.resolveLocalConfig(__dirname, (err, file) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  if (!err) cfg.merge(def, require(file));
});

module.exports = def;
