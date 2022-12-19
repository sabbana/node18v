/* eslint-disable no-undef */
import UserModel from '../../../model/user';

describe('POST /users/ - user create', () => {
  // const userCreated = {};
  it('user create without any params', async () => {
    const userModel = new UserModel();
    const data = await userModel.create();
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.password).toContain('Password can\'t be blank');
    expect(data.data.email).toContain('Email can\'t be blank');
    expect(data.data.phone).toContain('Phone can\'t be blank');
  });

  it('user create with correct params', async () => {
    const userModel = new UserModel();
    const data = await userModel.create({
      email: 'andrew@skyshi.com',
      first_name: 'Andrew',
      last_name: 'Junior',
      password: 'user',
      phone: '08562905595',
    });
    // userCreated = data.data;
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

  it('user create with existing email', async () => {
    const userModel = new UserModel();
    const data = await userModel.create({
      email: 'andrew@skyshi.com',
      phone: '0856290559511',
      password: 'user',
    });
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.email).toContain('Email already registered');
  });

  it('user create with existing phone', async () => {
    const userModel = new UserModel();
    const data = await userModel.create({
      email: 'andrew+123@skyshi.com',
      password: 'user',
      phone: '08562905595',
    });
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.phone).toContain('Phone number already registered');
  });

  it('user create with alphabet phone', async () => {
    const userModel = new UserModel();
    const data = await userModel.create({
      email: 'ucuppersawawaaer@gmali.com',
      first_name: 'Michaael',
      last_name: 'Bambang',
      password: 'user',
      phone: 'hello',
    });
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.phone).toContain('Phone is invalid');
  });

  it('user create with invalid email format', async () => {
    const userModel = new UserModel();
    const data = await userModel.create({
      email: 'ucuppersawawaaer',
      first_name: 'Michaael',
      last_name: 'Bambang',
      password: 'user',
      phone: 'hello',
    });
    expect(data.status).toBe(false);
    expect(data.code).toBe(400);
    expect(typeof data.data).toBe('object');
    expect(data.data.email).toContain('Email is not a valid email');
  });
});
