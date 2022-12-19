/* eslint-disable no-undef */
import UserModel from '../../../model/user';

describe('GET /users/{id} - user get', () => {
  const testData = {};
  beforeAll(async (done) => {
    const userModel = new UserModel();
    const user = await userModel.login('andrew@skyshi.com', 'andrew');

    testData.token = user.data.token;
    return done();
  });

  it('user get should work', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.get(1);
    expect(data.status).toBe(true);
    expect(data.code).toBe(200);
    expect(typeof data.data).toBe('object');
    expect(Object.keys(data.data)).toEqual(expect.arrayContaining([
      'user_id',
      'name',
    ]));
    expect(data.data).toEqual(expect.objectContaining({
      user_id: expect.any(Number),
      name: expect.any(String),
    }));
  });

  it('user get should not work if id=1000', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.get(1000);
    expect(data.status).toBe(false);
    expect(data.code).toBe(404);
  });

  it('user get should not work if token is not provided', async () => {
    const userModel = new UserModel();
    const data = await userModel.get(1);

    expect(data.status).toBe(false);
    expect(data.code).toBe(401);
  });
});
