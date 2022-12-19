import Hashids from 'hashids';
import rp from 'request-promise';
import sharp from 'sharp';
import fsModule from 'fs';
import Promise from 'bluebird';
import crypto from 'crypto';
import _ from 'lodash';
import CryptoJS from 'crypto-js';
import FCM from 'fcm-push';
import moment from 'moment';
import axios from 'axios';
import archiver from 'archiver';
import AWS from 'aws-sdk';
import OSS from 'ali-oss';
import apicache from 'apicache';
import { createObjectCsvWriter } from 'csv-writer';
import {
  OSS as OSSConfig,
  S3,
  crypto as cryptoConfig,
  fcm as fcmConfig,
  imagePath,
  dataPath,
  dataUrl,
  imageServiceAdapter as adapter,
} from '../../../config';
import {
  client as redisClient,
} from './redis';

const DEFAULT_COUNTRY_CODE = '+62';
const DEFAULT_COUNTRY_ID = 102;
const fs = Promise.promisifyAll(fsModule);

export const setDateFormat = (str = null, action = 'default') => {
  let output = '';

  const datetime = str === null ? moment() : str;

  switch (action) {
    case 'default':
    case 'toUnix':
      output = moment(datetime).unix();
      break;
    case 'fromUnixToDate':
      output = moment.unix(datetime).format('YYYY-MM-DD');
      break;
    default:
      output = moment(datetime).format('YYYY-MM-DD HH:mm:ss');
      break;
  }

  return output;
};

export const setCreditDays = (creditDays) => {
  let date = moment();

  if (creditDays > 0) {
    date = date.add(creditDays, 'days').endOf('day');
  }

  return setDateFormat(date);
};

export const generateRandomStringNew = (length) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.';
  let result = '';
  for (let i = length; i > 0; i -= 1) result += chars[Math.floor(Math.random() * chars.length)];

  return result;
};

export const generateRandomNumber = (length) => {
  const chars = '123456789';
  let result = '';
  for (let i = length; i > 0; i -= 1) result += chars[Math.floor(Math.random() * chars.length)];

  return result;
};

export const generateRandomToken = (length) => {
  const buf = crypto.randomBytes(length);
  return buf.toString('hex');
};

export const hashIdEncode = (str, key = '') => {
  const hashids = new Hashids(key, 10);
  return hashids.encode(str);
};
export const hashIdDecode = (str, key = '') => {
  const hashids = new Hashids(key, 10);
  const decodeStr = hashids.decode(str);
  return decodeStr.length > 0 ? decodeStr[0] : null;
};

export const hashIdEncodeNumber = (number, size = 5) => {
  let string = `${number} `;
  while (string.length <= size) string = `0${string}`;
  return string.trim();
};

export const hashIdDecodeNumber = (str) => Number(str);

export const uploadS3 = async (buff, folder, fileName) => {
  AWS.config.update({
    region: S3.region,
    accessKeyId: S3.accessKey,
    secretAccessKey: S3.secretKey,
  });
  const s3 = new AWS.S3();
  const imageFile = `${folder}/${fileName}`;
  const data = {
    Bucket: S3.bucketName,
    Key: imageFile,
    Body: buff,
    ACL: 'public-read',
    // ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
  };
  const upload = await s3.putObject(data).promise();
  return upload;
};

export const copyObjS3 = async (from, to) => {
  const options = {
    params: {
      Bucket: S3.bucketName,
    },
    accessKeyId: S3.accessKey,
    secretAccessKey: S3.secretKey,
  };
  const s3 = new AWS.S3(options);
  const copy = await s3.copyObject({
    Bucket: S3.bucketName,
    CopySource: `${S3.bucketName}/${from}`,
    Key: to,
    ACL: 'public-read',
  }).promise();
  return copy;
};

export const objExistS3 = async (key) => {
  AWS.config.update({
    region: S3.region,
    accessKeyId: S3.accessKey,
    secretAccessKey: S3.secretKey,
  });
  const s3 = new AWS.S3();
  try {
    const params = {
      Bucket: S3.bucketName,
      Key: key,
    };
    await s3.headObject(params).promise();
  } catch (err) {
    return false;
  }
  return true;
};

export const deleteObjS3 = async (key) => {
  const options = {
    params: {
      Bucket: S3.bucketName,
    },
    accessKeyId: S3.accessKey,
    secretAccessKey: S3.secretKey,
  };
  const s3 = new AWS.S3(options);
  const del = await s3.deleteObject({
    Key: key,
  }).promise();
  return del;
};

export const uploadFileS3 = async (buff, folder, fileName, options) => {
  AWS.config.update({
    region: S3.region,
    accessKeyId: S3.accessKey,
    secretAccessKey: S3.secretKey,
  });
  const s3 = new AWS.S3();
  const imageFile = `${folder}/${fileName}`;
  const data = {
    Bucket: S3.bucketName,
    Key: imageFile,
    Body: buff,
    ACL: 'public-read',
    ContentEncoding: options.contentEncoding,
    ContentType: options.contentType,
  };
  const upload = await s3.putObject(data).promise();
  return upload;
};

export const pathFileS3 = (str) => (str ? `${S3.content}${str}` : '');

export const downloader = async (url, filePath) => {
  try {
    const response = await axios({
      url,
      responseType: 'stream',
    });
    response.data.pipe(fs.createWriteStream(filePath));
    return true;
  } catch (err) {
    return err;
  }
};

export function phoneNumberSanitizer(phone, dialCode = null) {
  if (!phone) return null;
  if (phone.substr(0, 1) !== '+') {
    if (!dialCode) dialCode = DEFAULT_COUNTRY_CODE;
    if (phone.substr(0, 1) !== '0') {
      phone = dialCode + phone;
    } else {
      phone = dialCode + phone.substr(1);
    }
  }
  return phone;
}

export function cryptoEncrypt(data) {
  const token = CryptoJS.AES.encrypt(JSON.stringify(data), cryptoConfig.secret);
  return token.toString();
}

export function cryptoDecrypt(token) {
  const bytes = CryptoJS.AES.decrypt(token, cryptoConfig.secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function fcmMessage(message) {
  if (!fcmConfig.key) return false;
  const fcm = new FCM(fcmConfig.key);
  return fcm.send(message);
}

export function weekCount(dateInput) {
  const date = moment(dateInput);
  const week = Math.ceil(date.date() / 7);
  const month = moment(date);
  return {
    week,
    month: month.format('MM'),
    month_string: month.format('MMMM'),
  };
}

export function weekOfMonth(dateInput) {
  const input = moment(dateInput);
  const firstDayOfMonth = input.clone().startOf('month');
  const firstDayOfWeek = firstDayOfMonth.clone().startOf('week');

  const offset = firstDayOfMonth.diff(firstDayOfWeek, 'days');
  const week = Math.ceil((input.date() + offset) / 7);

  return {
    week,
    month: input.format('MM'),
    month_string: input.format('MMMM'),
  };
}

export const uploadLocal = async (base64Image, folder, fileName) => {
  const base64Data = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const imageBuffer = await sharp(base64Data).rotate().toBuffer();

  const dir = `${imagePath}/${folder}`;
  const filePath = `${dir}/${fileName}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  await fs.writeFileAsync(filePath, imageBuffer);

  return `/${folder}/${fileName}`;
};

export const uploadFileLocal = async (buffer, folder, fileName) => {
  const dir = `${dataPath}/${folder}`;
  const filePath = `${dir}/${fileName}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  await fs.writeFileAsync(filePath, buffer);
  return dataUrl(`/${folder}/${fileName}`);
};

export const createCsvFile = async (folder, fileName, header, data) => {
  const dir = `${dataPath}/${folder}`;
  const filePath = `${dir}/${fileName}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  /* eslint-disable new-cap */
  const createFile = new createObjectCsvWriter({
    path: filePath,
    header,
  });
  let res = false;
  await createFile.writeRecords(data).then(() => {
    res = dataUrl(`/${folder}/${fileName}`);
  });
  if (adapter === 'oss') {
    const oss = new OSS({
      region: OSSConfig.region,
      accessKeyId: OSSConfig.accessKey,
      accessKeySecret: OSSConfig.secretKey,
      bucket: OSSConfig.bucketName,
    });
    const fileLocation = `${folder}/${fileName}`;
    const dataFile = `${dataPath}/${folder}/${fileName}`;
    try {
      await oss.put(fileLocation, dataFile);
      await oss.putACL(fileLocation, 'public-read');
      res = `${OSSConfig.content}/${fileLocation}`;
    } catch (e) {
      throw new Error(`Trouble uploading file. Message: ${e}`);
    }
  }
  return res;
};

export const flattenErrorMessage = (obj) => _(obj).values().flatten().value();

export const paginationBuilder = (queryString) => {
  const { sort = 'id:desc' } = queryString;
  let { limit = 10, page = 1 } = queryString;
  limit = Number(limit);
  const offset = limit * (page < 1 ? 0 : page - 1);
  if (limit < 0) limit = 0;
  if (page < 1) page = 1;
  if (limit === '0') {
    limit = Number.MAX_SAFE_INTEGER;
  }
  let order;
  if (sort) {
    const tmp = sort.split(':');
    const sortField = tmp[0] || 'id';
    const sortType = tmp[1] || 'desc';
    order = [sortField, sortType];
  }
  page = Number(page);
  return {
    order, page, limit, offset,
  };
};

export const getFcmTopic = async (registrationId) => {
  const url = `${fcmConfig.urlApi}/info/${registrationId}`;
  const params = {
    uri: url,
    qs: {
      details: true,
    },
    method: 'get',
    headers: {
      Authorization: `key=${fcmConfig.key}`,
    },
    json: true,
  };
  return rp(params);
};

export const setFcmTopic = async (registrationId, topic, type) => {
  if (!fcmConfig.key) return false;
  let url = `${fcmConfig.urlApi}/v1`;
  if (type === 'subscribe') {
    url += ':batchAdd';
  } else {
    url += ':batchRemove';
  }

  const params = {
    uri: url,
    body: {
      to: `/topics/${fcmConfig.prefix}${topic}`,
      registration_tokens: [
        registrationId,
      ],
    },
    method: 'post',
    headers: {
      Authorization: `key=${fcmConfig.key}`,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  return rp(params);
};

export function titleCase(string) {
  const t = string.replace(/_/g, ' ');
  const sentence = t.toLowerCase().split(' ');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sentence.length; i++) {
    sentence[i] = sentence[i].charAt(0).toUpperCase() + sentence[i].slice(1);
  }
  return sentence.join(' ');
}

export const apiCache = apicache.options({ redisClient });

export const locationLatLong = async (long, lat) => {
  const token = 'pk.eyJ1Ijoic2Fwb2UiLCJhIjoiY2szZ3UxN3FqMDVtaDNtbXNvZzYxeTN2ZSJ9.Vz58F0AvPkHBYMkXF3R7Xg';
  const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?access_token=${token}`;
  try {
    const result = {};
    const response = await axios.get(mapboxUrl);
    if (response.data) {
      if (response.data.features) {
        result.address = response.data.features[0] ? response.data.features[0].place_name : '';
        response.data.features.forEach((d) => {
          d.place_type.forEach((place) => {
            if (place === 'neighborhood') result.village = d.text;
            if (place === 'locality') result.district = d.text;
            if (place === 'place') result.regency = d.text;
            if (place === 'region') result.province = d.text;
            if (place === 'postcode') result.zip_code = d.text;
          });
        });
      }
    }
    return result;
  } catch (err) {
    return err;
  }
};

export const categorySla = (number) => {
  let result = 'Normal';
  if (number >= 1 && number <= 7) result = '0-1 Minggu';
  if (number >= 8 && number <= 14) result = '1-2 Minggu';
  if (number >= 15 && number <= 21) result = '2-3 Minggu';
  if (number >= 22 && number <= 28) result = '3-4 Minggu';
  if (number > 29) result = '1 Bulan';
  return result;
};

export const zipDirectory = (source, out) => {
  const output = `${dataPath}/${out}`;
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(output);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

export const uploadFileOSS = async (buff, folder, fileName, options) => {
  const oss = new OSS({
    region: OSSConfig.region,
    accessKeyId: OSSConfig.accessKey,
    accessKeySecret: OSSConfig.secretKey,
    bucket: OSSConfig.bucketName,
  });
  const fileLocation = `${folder}/${fileName}`;
  try {
    await oss.put(fileLocation, buff, options);
    await oss.putACL(fileLocation, 'public-read');
    return true;
  } catch (e) {
    throw new Error(`Trouble uploading file. Message: ${e}`);
  }
};

export const pathFileOSS = (str) => (str ? `${OSSConfig.content}${str}` : '');

export default {
  generateRandomStringNew,
  hashIdEncode,
  hashIdDecode,
  hashIdEncodeNumber,
  hashIdDecodeNumber,
  generateRandomNumber,
  uploadS3,
  generateRandomToken,
  pathFileS3,
  downloader,
  phoneNumberSanitizer,
  cryptoEncrypt,
  cryptoDecrypt,
  uploadFileS3,
  fcmMessage,
  weekCount,
  weekOfMonth,
  uploadLocal,
  uploadFileLocal,
  createCsvFile,
  flattenErrorMessage,
  paginationBuilder,
  setDateFormat,
  setCreditDays,
  setFcmTopic,
  getFcmTopic,
  DEFAULT_COUNTRY_ID,
  copyObjS3,
  deleteObjS3,
  objExistS3,
  titleCase,
  apiCache,
  locationLatLong,
  categorySla,
  zipDirectory,
  uploadFileOSS,
  pathFileOSS,
};
