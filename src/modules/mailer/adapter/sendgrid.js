import pug from 'pug';
import sendgrid from '@sendgrid/mail';
import _ from 'lodash';

export class Sendgrid {
  constructor(options = {}) {
    if (!_.isObject(options)) {
      throw new Error('Invalid options passed to Sendgrid');
    }

    if (options.apiKey === undefined) {
      throw new Error('Sengrid API key not present, please set the `config.sendgrid.apiKey` in your setting file');
    }

    if (options.fromEmail === undefined) {
      throw new Error('Sengrid sender address not present, please set the `config.sendgrid.fromEmail` in your setting file');
    }

    options.params = options.params || {};
    this.options = options;
    this.client = sendgrid;
    this.client.setApiKey(options.apiKey);
  }

  /**
   * Load email template
   * @param {string} file
   * @param {Object} params
   * @return {string}
   */
  template(file, params = {}) {
    const compiled = pug.compileFile(file);
    return compiled({
      ...params,
      ...this.options.params,
    });
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
    const msg = {
      to,
      from,
      subject,
      html: content,
    };
    return this.client.send(msg);
  }
}

export default { Sendgrid };
