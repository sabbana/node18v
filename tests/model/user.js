import request from 'supertest';
import Promise from 'bluebird';
import querystring from 'querystring';
import app from '../../src/app';

class UserModel {
  constructor(token = null) {
    if (token) {
      this.token = token;
    }
    this.request = request(app);
  }

  setToken(token) {
    this.token = token;
  }

  login(email, password) {
    return new Promise((resolve) => {
      this.request
        .post('/users/login')
        .send({
          email,
          password,
        })
        .set('Content-Type', 'application/json')
        .then((res) => {
          resolve(res.body);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  }

  create(params = {}) {
    return new Promise((resolve) => {
      this.request
        .post('/users')
        .send(params)
        .set('Content-Type', 'application/json')
        .then((res) => {
          resolve(res.body);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  }

  get(id) {
    return new Promise((resolve) => {
      this.request
        .get(`/users/${id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `JWT ${this.token}`)
        .then((res) => {
          resolve(res.body);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  }

  update(id, params = {}) {
    return new Promise((resolve) => {
      this.request
        .put(`/users/${id}`)
        .send(params)
        .set('Content-Type', 'application/json')
        .set('Authorization', `JWT ${this.token}`)
        .then((res) => {
          resolve(res.body);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  }

  getAll(params = {}) {
    return new Promise((resolve) => {
      this.request
        .get(`/users?${querystring.stringify(params)}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `JWT ${this.token}`)
        .then((res) => {
          resolve(res.body);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  }
}

export default UserModel;
