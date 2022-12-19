import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import flash from 'connect-flash';
import cors from 'cors';
import helmet from 'helmet';
import statusMonitor from 'express-status-monitor';
import Raven from 'raven';
import _ from 'lodash';
import { DataTypes } from 'sequelize';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import path from 'path';
import config from '../config';
import c from './constants';
import coreModule from './modules/core';

// import custom modules heres
const app = express();
const sequelize = coreModule.sequelize.db;
const RedisStore = connectRedis(session);
const redisClient = coreModule.redis.client;

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection:', err.stack);
});

const sentry = config.sentry.enable;
if (sentry) {
  Raven.config(config.sentry.dsn).install();
}

// app.use(statusMonitor({ websocket: io }));
app.use(statusMonitor({
  path: '/api/status',
}));
app.use(cors({
  origin: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
}));
app.use(helmet());
app.use(compression());
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(express.static(config.publicPath, { maxAge: c.ONE_YEAR }));

app.set('trust proxy', 1);
// const sessionStore = new SequelizeStore({
//   db: sequelize,
//   expiration: config.jwt.expiresIn,
// });

app.use(cookieParser());
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  store: new RedisStore({ client: redisClient, ttl: 60 }),
}));
app.use(flash());

// configure passport middleware
// this must be defined after session middleware
// see: http://passportjs.org/docs#middleware
// userModule.passport.configure(app);

// set default express behavior
// disable x-powered-by signature
// and enable case-sensitive routing
app.set('env', config.env);
app.set('x-powered-by', false);
app.set('case sensitive routing', true);
app.set('views', path.join(__dirname, 'modules'));
app.set('view engine', 'pug');

// set model
const models = [];

for (const modelCollection of models) {
  for (const modelKey in modelCollection) {
    if (Object.prototype.hasOwnProperty.call(modelCollection, modelKey)) {
      const model = modelCollection[modelKey];
      if (model.init && typeof model.init === 'function') {
        // console.log('register:', modelKey);
        model.init(sequelize, DataTypes);
      }
    }
  }
}

const sequelizeModels = sequelize.models;
_.forEach(Object.keys(models), (n) => {
  _.forEach(models[n], (model) => {
    if (model.associate !== undefined) {
      model.associate(sequelizeModels);
    }
  });
});

// configure middleware
app.use(coreModule.middleware.requestLoggerMiddleware());
app.use(coreModule.middleware.requestUtilsMiddleware());
app.use(coreModule.middleware.responseUtilsMiddleware());
app.use(coreModule.middleware.apiResponse());

// should be the first item before registering any routes
// see: https://docs.sentry.io/clients/node/integrations/express/
if (sentry) app.use(Raven.requestHandler());

app.use(coreModule.routes);
// app.use(oauthModule.routes);

// should be coming first before any other error handler
if (sentry) app.use(Raven.errorHandler());

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  const err = new Error('Path not found');
  err.httpStatus = 404;
  next(err);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('err stack', req.path, err);
  if (res.API) {
    res.API.error(err);
  } else {
    res.status(500).json({
      meta: {
        code: 400,
        status: false,
        message: 'Failed.',
      },
      data: {},
    });
  }
});

export default app;
