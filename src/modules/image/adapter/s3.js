import sharp from 'sharp';
import AWS from 'aws-sdk';

export class S3Image {
  constructor(options = {}) {
    if (options.accessKey === undefined || options.secretKey === undefined) {
      throw new Error('AWS Secret key or Access Key not present');
    }
    if (options.bucketName === undefined) {
      throw new Error('AWS Bucket Name not present');
    }
    if (options.region === undefined) {
      throw new Error('AWS Region not present');
    }
    AWS.config.update({
      region: options.region,
      accessKeyId: options.accessKey,
      secretAccessKey: options.secretKey,
    });
    const s3 = new AWS.S3();
    this.client = s3;
    this.options = options;
  }

  async upload(base64Image, folder, fileName, origin = false, width = 540) {
    let base64Data;
    if (base64Image.includes('data:image')) {
      base64Data = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    } else {
      base64Data = base64Image;
    }
    let imageBuffer = await sharp(base64Data).rotate().resize(width).toBuffer();
    if (origin) imageBuffer = await sharp(base64Data).rotate().toBuffer();
    const imageFile = `${folder}/${fileName}`;
    const S3 = this.options;
    const data = {
      Bucket: S3.bucketName,
      Key: imageFile,
      Body: imageBuffer,
      ACL: 'public-read',
      ContentType: 'image/jpeg',
    };
    const s3 = this.client;
    await s3.putObject(data).promise();
    return `/${folder}/${fileName}`;
  }

  imageUrl(imagePath) {
    const S3 = this.options;
    return (imagePath ? `${S3.content}${imagePath}` : '');
  }
}

export default { S3Image };
