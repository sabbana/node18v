import sharp from 'sharp';
import OSS from 'ali-oss';
import fs from 'fs';

export class OSSImage {
  constructor(options = {}) {
    if (options.accessKey === undefined || options.secretKey === undefined) {
      throw new Error('OSS Secret key or Access Key not present');
    }
    if (options.bucketName === undefined) {
      throw new Error('OSS Bucket Name not present');
    }
    if (options.region === undefined) {
      throw new Error('OSS Region not present');
    }
    const oss = new OSS({
      region: options.region,
      accessKeyId: options.accessKey,
      accessKeySecret: options.secretKey,
      bucket: options.bucketName,
    });
    this.client = oss;
    this.options = options;
  }

  async upload(base64Image, folder, fileName, origin = false, width = 540, isBase64 = true) {
    let base64Data;
    if (!isBase64) {
      const bitmap = fs.readFileSync(base64Image);
      base64Data = Buffer.from(bitmap).toString('base64');
    }
    if (base64Image.includes('data:image')) {
      base64Data = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    } else {
      base64Data = base64Image;
    }
    let imageBuffer = await sharp(base64Data).rotate().resize(width).toBuffer();
    if (origin) imageBuffer = await sharp(base64Data).rotate().toBuffer();
    const imageFile = `${folder}/${fileName}`;
    try {
      await this.client.put(imageFile, imageBuffer, { mime: 'image/png' });
      await this.client.putACL(imageFile, 'public-read');
      if (!isBase64) {
        try {
          fs.unlinkSync(base64Image);
        } catch (e) {
          /* continue regardless of error */
        }
      }
    } catch (e) {
      throw new Error(`Trouble uploading file. Message: ${e}`);
    }
    return `/${folder}/${fileName}`;
  }

  imageUrl(imagePath) {
    return (imagePath ? `${this.options.content}${imagePath}` : '');
  }
}

export default { OSSImage };
