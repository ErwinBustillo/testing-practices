const Reservation = require('./schema/reservation');

describe('fetch', () => {
  let reservations;

  beforeAll(() => {
    jest.mock('./reservations');
    reservations = require('./reservations');
  });

  afterAll(() => {
    jest.unmock('./reservations');
  });

  it('should be mocked and not create a database record', () => {
    expect(reservations.fetch()).toBeUndefined();
  });
})

describe('save', () => {
  let reservations;
  const mockDebug = jest.fn();
  const mockInsert = jest.fn().mockResolvedValue([1]);

  beforeAll(() => {
    jest.mock('debug', () => () => mockDebug);
    jest.mock('./knex', () => () => ({
      insert: mockInsert,
    }));
    reservations = require('./reservations');
  });

  afterAll(() => {
    jest.unmock('debug');
    jest.unmock('./knex');
  });

  it('should resolve with the id upon success', async () => {
    const value = { foo: 'bar' }
    const expected = [1];
    const actual = await reservations.save(value);
    expect(actual).toStrictEqual(expected);
    expect(mockDebug).toBeCalledTimes(1);
    expect(mockInsert).toBeCalledWith(value);
  });
});

describe('validate', () => {
  let reservations;

  beforeAll(() => {
    reservations = require('./reservations');
  });

  it('should resolve with no optional fields', async () => {
    const reservation = new Reservation({
      date: '2017/06/10',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username@example.com',
    });

    await expect(reservations.validate(reservation))
      .resolves.toEqual(reservation);
  });

  it('should reject with an invalid email', async () => {
    const reservation = new Reservation({
      date: '2017/06/10',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username',
    });

    await expect(reservations.validate(reservation))
      .rejects.toBeInstanceOf(Error);
  });

  it('should be called and reject empty input', async () => {
    const mock = jest.spyOn(reservations, 'validate');

    const value = undefined;
    await expect(reservations.validate(value))
      .rejects.toThrow('Cannot read property \'validate\' of undefined');
    expect(mock).toBeCalledWith(value);

    mock.mockRestore();
  });
});

describe('create', () => {
  let reservations;

  it('should reject if validation fails', async () => {
    reservations = require('./reservations');
    // Store the original.
    const original = reservations.validate;

    const error = new Error('fail');

    // Mock the function.
    reservations.validate = jest.fn(() => Promise.reject(error));
    await expect(reservations.create())
      .rejects.toBe(error);

    expect(reservations.validate).toBeCalledTimes(1);

    // Restore.
    reservations.validate = original;
  });

  it('should reject if validation fails using spyOn', async () => {
    reservations = require('./reservations');
    const mock = jest.spyOn(reservations, 'validate');
    const error = new Error('fail');
    mock.mockImplementation(() => Promise.reject(error));

    const value = 'puppy';
    await expect(reservations.create(value)).rejects.toEqual(error);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(value);

    // Restore.
    mock.mockRestore();
  });

  it('should create a reservation if there are no validation problems', async () => {
    // Prepare to require.
    const expectedInsertId = 1;
    const mockInsert = jest.fn().mockResolvedValue([expectedInsertId]);
    jest.mock('./knex', () => () => ({
      insert: mockInsert,
    }));

    reservations = require('./reservations');

    // Mock validation.
    const mockValidation = jest.spyOn(reservations, 'validate');
    mockValidation.mockImplementation(value => Promise.resolve(value));

    // Prepare test data.
    const reservation = { foo: 'bar' };

    // Execute and check.
    await expect(reservations.create(reservation))
      .resolves.toStrictEqual(expectedInsertId);
    expect(reservations.validate).toBeCalledTimes(1);
    expect(mockValidation).toBeCalledWith(reservation);
    expect(mockValidation).toBeCalledTimes(1);

    // Restore.
    mockValidation.mockRestore();
    jest.unmock('./knex');
  });
});
