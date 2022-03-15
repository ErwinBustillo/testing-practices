const reservations = require("./reservations");
const Reservation = require("./schema/reservation");

describe("fetch", () => {
  let reservations;
  beforeAll(() => {
    jest.mock("./reservations.js");
    reservations = require("./reservations");
  });
  afterAll(() => {
    jest.unmock("./reservations.js");
  });

  it("shoould be mocked and not create a database record", () => {
    expect(reservations.fetch()).toBeUndefined();
  });
});

describe.skip("save", () => {
  let reservations;
  const mockDebug = jest.fn();
  const mockInsert = jest.fn().mockResolvedValue([1]);
  beforeAll(() => {
    jest.mock("debug", () => () => mockDebug);
    jest.mock("./knex", () => () => ({
      insert: mockInsert,
    }));
    reservations = require("./reservations");
  });
  afterAll(() => {
    jest.unmock("debug");
    jest.unmock("./knex.js");
  });
  it("should resolve with the id upon success", async () => {
    const value = { foo: "bar" };
    const expected = [1];

    const current = await reservations.save(value);
    expect(current).toStrictEqual(expected);
    expected(mockDebug).toBeCalledTimes(1);
    expect(mockInsert).toBeCalledWith(value);
  });
});

describe("validate", () => {
  it("should resolve with no optional fields", () => {
    const reservation = new Reservation({
      date: "2017/06/10",
      time: "06:02 AM",
      party: 4,
      name: "Family",
      email: "username@example.com",
    });
    return reservations
      .validate(reservation)
      .then((value) => expect(value).toEqual(reservation));
  });

  it("should reject with an invalid email", () => {
    const reservation = new Reservation({
      date: "2017/06/10",
      time: "06:02 AM",
      party: 4,
      name: "Family",
      email: "username",
    });

    expect.assertions(1);

    return reservations
      .validate(reservation)
      .catch((err) => expect(err).toBeInstanceOf(Error));
  });

  it("should be called and reject empty input", async () => {
    const mock = jest.spyOn(reservations, "validate");
    const value = undefined;
    await expect(reservations.validate(value)).rejects.toThrow();
    expect(mock).toBeCalledWith(value);
    mock.mockRestore();
  });
});

describe("create", () => {
  it("should reject if validation fails", async () => {
    const origin = reservations.validate;
    const error = new Error("fail");

    reservations.validate = jest.fn(() => Promise.reject(error));

    await expect(reservations.create()).rejects.toBe(error);

    expect(reservations.validate).toBeCalledTimes(1);

    reservations.validate = origin;
  });

  it("should reject if validation fails with spyOn", async () => {
    const mock = jest.spyOn(reservations, "validate");
    const error = new Error("fail");

    mock.mockImplementation(() => Promise.reject(error));

    const value = "puppy";

    await expect(reservations.create(value)).rejects.toEqual(error);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(value);
    mock.mockRestore();
  });

  it.skip("should create a reservation without issues", async () => {
    const expected = 1;
    const mockInsert = jest.fn().mockResolvedValue([expected]);

    jest.mock("./knex.js", () => () => ({
      insert: mockInsert,
    }));

    reservations = require("./reservations");

    const mockValidation = jest.spyOn(reservations, "validate");
    mockValidation.mockImplementation((value) => Promise.resolve(value));

    const reservation = { foo: "bar" };

    await expect(reservations.create(reservation)).resolves.toStrictEqual(
      expected
    );

    expect(reservations.validate).toHaveBeenCalledTimes(1);
    expect(mockValidation).toBeCalledWith(reservation);
    expect(mockValidation).toBeCalledTimes(1);
    mockValidation.mockRestore();
    jest.unmock("./knex.js");
  });
});
