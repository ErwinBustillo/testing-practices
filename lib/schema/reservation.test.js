const Reservation = require("./reservation");
describe("combineDateTime", () => {
  it("should return an ISO 8601 data and time with valid input", () => {
    const date = "2017/06/10";
    const time = "06:02 AM";

    const expected = "2017-06-10T06:02:00.000Z";
    const current = Reservation.combineDateTime(date, time);

    expect(current).toEqual(expected);
  });

  it("should return null on a bad date and time", () => {
    const date = "test";
    const time = "fail";

    expect(Reservation.combineDateTime(date, time)).toBeNull();
  });
});

describe("validate", () => {
  it("should validate with no optional fields", (done) => {
    const reservation = new Reservation({
      date: "2017/06/10",
      time: "06:02 AM",
      party: 4,
      name: "Family",
      email: "username@example.com",
    });
    reservation.validate((error, value) => {
      try {
        expect(value).toEqual(reservation);
        return done(error);
      } catch (error) {
        return done(error);
      }
    });
  });

  it("should invalidate with an invalid email", (done) => {
    const reservation = new Reservation({
      date: "2017/06/10",
      time: "06:02 AM",
      party: 4,
      name: "Family",
      email: "username",
    });

    reservation.validate((error) => {
      try {
        expect(error).toBeInstanceOf(Error);
        return done();
      } catch (error) {
        return done(error);
      }
    });
  });
});
