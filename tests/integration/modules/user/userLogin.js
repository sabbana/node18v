/* eslint-disable no-undef */
import UserModel from '../../../model/user';

describe('POST /users/login/ - user login', () => {
  it('user login any without params', async () => {
    const userModel = new UserModel();
    const data = await userModel.login('', '');
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.email).toContain('Email can\'t be blank');
    expect(data.data.password).toContain('Password can\'t be blank');
  });

  it('user login without email', async () => {
    const userModel = new UserModel();
    const data = await userModel.login('', 'user');
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.email).toContain('Email can\'t be blank');
  });

  it('user login without password', async () => {
    const userModel = new UserModel();
    const data = await userModel.login('yusuf@skyshi.com', '');
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.password).toContain('Password can\'t be blank');
  });

  it('user login with invalid password', async () => {
    const userModel = new UserModel();
    const data = await userModel.login('andrew@skyshi.com', 'asd');
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.password).toContain('Invalid password');
  });

  it('user login with invalid email', async () => {
    const userModel = new UserModel();
    const data = await userModel.login('invalid@skyshi.com', 'asd');
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.email).toContain('Email or phone number is not registered');
  });

  it('user login with correct params', async () => {
    const userModel = new UserModel();
    const data = await userModel.login('andrew@skyshi.com', 'andrew');
    expect(data.status).toBe(true);
    expect(data.code).toBe(200);
    expect(typeof data.data).toBe('object');
  });
});
