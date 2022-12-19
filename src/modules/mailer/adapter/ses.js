import pug from 'pug';
import AWS from 'aws-sdk';

export class SES {
  constructor(options = {}) {
    if (options.accessKey === undefined || options.secretKey === undefined) {
      throw new Error('Secret key or Access Key not present');
    }

    if (options.fromEmail === undefined) {
      throw new Error('Sender address not present');
    }
    AWS.config.update({
      accessKeyId: options.accessKey,
      secretAccessKey: options.secretKey,
      region: options.region,
    });
    const ses = new AWS.SES({ apiVersion: '2022-12-01' });
    this.client = ses;
    this.options = options;
  }

  /**
   * Load email template
   * @param {string} file
   * @param {Object} params
   * @return {string}
   */
  template(file, params = {}) {
    const compiled = pug.compileFile(file);
    return compiled({ ...params, ...this.options.params });
  }

  /**
   * Send email
   * @param {string} to
   * @param {string} subject
   * @param {string} content
   * @param {Object} options
   * @return {Promise}
   */
  async send(to, subject, content, options = {}) {
    const from = options.fromEmail ? options.fromEmail : this.options.fromEmail;
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: content,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      ReturnPath: from,
      Source: from,
    };

    AWS.config.update({
      accessKeyId: this.options.accessKey,
      secretAccessKey: this.options.secretKey,
      region: this.options.region,
    });
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    return ses.sendEmail(params).promise();
  }
}

export default { SES };
