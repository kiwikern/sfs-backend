const rewire = require('rewire');
const userLogin = rewire('../../../src/user/user.login.js');

describe(`UserLogin`, () => {
  let ctx;
  beforeEach(() => {
    ctx = {response: {}, request: {}};
  });

  it('should return 400 with empty body', () => {
    ctx.request.body = {};
    userLogin.login(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('invalid_request');
  });

  it('should return 400 without body', () => {
    userLogin.login(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('invalid_request');
  });

  it('should return 401 when no user is found by user', (done) => {
    userLogin.__set__(getServiceMock());
    ctx.request.body = {userName: 'h', password: 'd'};
    userLogin.login(ctx).then(() => {
      expect(ctx.response.status).toBe(401);
      expect(ctx.response.body.key).toBe('user_not_found');
      done();
    });
  });

  it('should return 401 when no user is found by mail', (done) => {
    userLogin.__set__(getServiceMock());
    ctx.request.body = {mailAddress: 'h', password: 'd'};
    userLogin.login(ctx).then(() => {
      expect(ctx.response.status).toBe(401);
      expect(ctx.response.body.key).toBe('user_not_found');
      done();
    });
  });

  it('should return 401 when password is wrong for correct userName', (done) => {
    userLogin.__set__(getServiceMock());
    ctx.request.body = {userName: 'correct', password: 'd'};
    userLogin.login(ctx).then(() => {
      expect(ctx.response.status).toBe(401);
      expect(ctx.response.body.key).toBe('wrong_password');
      done();
    });
  });

  it('should return 401 when password is wrong for correct mailAddress', (done) => {
    userLogin.__set__(getServiceMock());
    ctx.request.body = {mailAddress: 'correct', password: 'd'};
    userLogin.login(ctx).then(() => {
      expect(ctx.response.status).toBe(401);
      expect(ctx.response.body.key).toBe('wrong_password');
      done();
    });
  });

  it('should return 200 when credentials ok by userName', (done) => {
    userLogin.__set__(getServiceMock());
    ctx.request.body = {userName: 'correct', password: 'correct'};
    userLogin.login(ctx).then(() => {
      expect(ctx.response.status).toBe(200);
      done();
    });
  });

  it('should return 200 when credentials ok by mailAddress', (done) => {
    userLogin.__set__(getServiceMock());
    ctx.request.body = {mailAddress: 'correct', password: 'correct'};
    userLogin.login(ctx).then(() => {
      expect(ctx.response.status).toBe(200);
      done();
    });
  });

  function getServiceMock() {
    return {
      userSanitizer: {getNormalizedUserIfValid: body => (!body || body === {}) ? false : body },
      userService: {findUser: user => {
        if (user._id) {
          return user._id === 'correct' ? Promise.resolve({password: ''}) : Promise.resolve(null);
        } else {
          if (user.$or[0].mailAddress === 'correct' || String(user.$or[1].userName) === '/correct/i') {
            return Promise.resolve({password: ''});
          } else {
            return Promise.resolve(null);
          }
        }
      }},
      tokenGenerator: {generateToken: (_, ctx) => ctx.response.status = 200},
      bcrypt: {compare: (pw, _, fn) => fn('', pw === 'correct')}
    };
  }

});
