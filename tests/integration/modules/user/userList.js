/* eslint-disable no-undef */
import UserModel from '../../../model/user';

describe('GET /users/ - user list', () => {
  const testData = {};
  beforeAll(async (done) => {
    const userModel = new UserModel();
    const user = await userModel.login('yusuf@skyshi.com', 'user');

    testData.token = user.data.token;
    return done();
  });

  it('user list should work', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.getAll();

    expect(data.status).toBe(true);
    expect(data.code).toBe(200);
    expect(typeof data.meta).toBe('object');
    expect(typeof data.data).toBe('object');
    expect(Object.keys(data.data[0])).toEqual(expect.arrayContaining([
      'user_id',
      'name',
    ]));
    expect(data.data[0]).toEqual(expect.objectContaining({
      user_id: expect.any(Number),
      name: expect.any(String),
    }));
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  it('user list should not work if page=1000', async () => {
    const userModel = new UserModel(testData.token);
    const data = await userModel.getAll({ page: 1000 });

    expect(data.status).toBe(true);
    expect(data.code).toBe(200);
    expect(typeof data.meta).toBe('object');
    expect(typeof data.data).toBe('object');
    expect(data.data.length).toEqual(0);
  });

  it('user list should not work if token is not provided', async () => {
    const userModel = new UserModel();
    const data = await userModel.getAll();

    expect(data.status).toBe(false);
    expect(data.code).toBe(401);
  });
});
