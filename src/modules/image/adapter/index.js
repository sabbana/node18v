import config from '../../../../config';
import { LocalImage } from './local';
import { S3Image } from './s3';
import { OSSImage } from './oss';

const instance = {};

export default function factory(adapter) {
  adapter = String(adapter || config.imageServiceAdapter).toLowerCase();

  switch (adapter) {
    case 'local':
      instance[adapter] = new LocalImage(config.localImage);
      break;
    case 's3':
      instance[adapter] = new S3Image(config.S3);
      break;
    case 'oss':
      instance[adapter] = new OSSImage(config.OSS);
      break;
    default:
      throw new Error(`Invalid image adapter: ${adapter}.`);
  }

  return instance[adapter];
}
