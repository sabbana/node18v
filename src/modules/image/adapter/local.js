import fsModule from 'fs';
import Promise from 'bluebird';
import sharp from 'sharp';

const fs = Promise.promisifyAll(fsModule);

export class LocalImage {
  constructor(options = {}) {
    this.options = options;
  }

  async upload(base64Image, folder, fileName, origin = true, width = 540) {
    let base64Data;
    if (base64Image.includes('data:image')) {
      base64Data = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    } else {
      base64Data = base64Image;
    }
    let imageBuffer = await sharp(base64Data).rotate().resize(width).toBuffer();
    if (origin) imageBuffer = await sharp(base64Data).rotate().toBuffer();
    const { imagePath } = this.options;
    const dir = `${imagePath}/${folder}`;
    const filePath = `${dir}/${fileName}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    await fs.writeFileAsync(filePath, imageBuffer);
    return `/${folder}/${fileName}`;
  }

  imageUrl(imagePath) {
    return this.options.imageUrl(imagePath);
  }
}

export default { LocalImage };
