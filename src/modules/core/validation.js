import validate from 'validate.js';
import { Op } from 'sequelize';
import Promise from 'bluebird';
import { db as sequelize } from './sequelize';
import { hashIdDecode } from './helpers';

validate.validators.uniqueUsername = async (value, options) => {
  const { UserDetail } = sequelize.models;
  const id = hashIdDecode(options);
  let query;
  if (!value) return Promise.resolve();
  if (!value.match(/^[a-zA-Z0-9_.]{5,25}$/)) return Promise.resolve('^Username maximum lengths are 25 characters, can\'t contain space and can only contains alphanumeric, underscore and dot characters');
  if (id) {
    query = {
      username: {
        [Op.eq]: value,
      },
      user_id: {
        [Op.not]: id,
      },
    };
  } else {
    query = {
      username: {
        [Op.eq]: value,
      },
    };
  }
  const user = await UserDetail.findOne({
    where: query,
  });
  if (user) {
    return Promise.resolve('^Username already registered');
  }
  return Promise.resolve();
};

validate.validators.uniqueMobileNumber = async (value, options) => {
  const { UserDetail } = sequelize.models;
  const id = hashIdDecode(options);
  let query;
  if (!value) return Promise.resolve();
  value = value.trim().replace(/^(\+62|62|0)/g, '');
  if (value.match(/\D/)) return Promise.resolve('^Mobile Number contain non number');
  if (id) {
    query = {
      mobile_number: {
        [Op.eq]: value,
      },
      user_id: {
        [Op.not]: id,
      },
    };
  } else {
    query = {
      mobile_number: {
        [Op.eq]: value,
      },
    };
  }
  const user = await UserDetail.findOne({
    where: query,
  });
  if (user) {
    return Promise.resolve('^Mobile Number already registered');
  }
  return Promise.resolve();
};

validate.validators.uniqueEmail = async (value, options) => {
  const { User } = sequelize.models;
  const id = hashIdDecode(options);
  if (!value) return Promise.resolve();
  // eslint-disable-next-line
  const emailValidation = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailValidation.test(value)) {
    return Promise.resolve('^Invalid email format');
  }
  let query;
  if (id) {
    query = {
      email: value,
      id: {
        [Op.not]: id,
      },
    };
  } else {
    query = {
      email: value,
    };
  }
  const user = await User.findOne({ where: query });
  if (user) {
    return Promise.resolve('^Email already registered');
  }
  return Promise.resolve();
};

validate.validators.uniqueRadioUsername = async (value, options) => {
  const { Radio } = sequelize.models;
  const id = hashIdDecode(options);
  let query;
  if (!value) return Promise.resolve();
  if (!value.match(/^[a-zA-Z0-9_.]+$/)) return Promise.resolve('^Username can\'t contain space and can only contains alphanumeric, underscore and dot characters');
  if (id) {
    query = {
      username: {
        [Op.eq]: value,
      },
      id: {
        [Op.not]: id,
      },
    };
  } else {
    query = {
      username: {
        [Op.eq]: value,
      },
    };
  }
  const radio = await Radio.count({
    where: query,
  });
  if (radio) {
    return Promise.resolve('^Username already registered');
  }
  return Promise.resolve();
};
