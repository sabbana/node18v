/* eslint-disable no-undef */
import UserModel from '../../../model/user';

describe('PUT /users/{id} - user update', () => {
  const testData = {};
  beforeAll(async (done) => {
    const userModel = new UserModel();
    const user = await userModel.login('andrew@skyshi.com', 'user');

    testData.token = user.data.token;
    return done();
  });

  it('user partial update should work', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.update(1, { name: 'Andrew' });
    expect(data.status).toBe(true);
    expect(data.code).toBe(200);
    expect(typeof data.data).toBe('object');
  });
  it('user update should work if no data is provided', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.update(1);
    expect(data.status).toBe(true);
    expect(data.code).toBe(200);
  });

  it('user update should not work if token is not provided', async () => {
    const userModel = new UserModel();
    const data = await userModel.update(1, { name: 'Andrew' });

    expect(data.status).toBe(false);
    expect(data.code).toBe(401);
  });

  it('user update should not work if id is other user', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.update(1, { name: 'Andrew' });
    expect(data.status).toBe(false);
    expect(data.code).toBe(403);
  });

  it('user update should not work if id is not found', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.update(200, { name: 'Andrew' });
    expect(data.status).toBe(false);
    expect(data.code).toBe(403);
  });
});
