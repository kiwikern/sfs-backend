const request = require('supertest');
const appHelper = require('../app.helper');
const dbHelper = require('../db.helper.js');
const userHelper = require('../user/user.helper.js');
const scheduleHelper = require('./schedule.helper.js');

describe('Schedule', () => {
  beforeAll((done) => {
    let agent;
    appHelper.init()
      .then(() => agent = request.agent(appHelper.listen()))
      .then(() => dbHelper.init())
      .then(() => userHelper.init(agent))
      .then(() => scheduleHelper.init(agent))
      .then(() => done());
  });

  let token;
  let workoutId;
  let comment;
  beforeEach(done => {
    const user = {
      userName: 'test',
      mailAddress: 'test@test.de',
      password: '123456'
    };

    dbHelper.drop()
      .then(() => dbHelper.insertSchedule())
      .then(() => scheduleHelper.getSchedule())
      .then(response => workoutId = response.body[0]._id)
      .then(() => userHelper.register(user))
      .then(response => token = response.body.token)
      .then(() => {
        comment = {
          workoutId: workoutId,
          text: 'text',
          userId: 'userId',
          highlights: ['first', 'second'],
          instructors: ['instructor'],
          attendance: 3,
        };
      })
      .then(() => done());
  });


  it('should reject empty comment', (done) => {
    scheduleHelper.addComment(token, {})
      .then(response => {
        expect(response.status).toBe(400);
        expect(response.body.key).toBe('missing_text');
        done();
      });
  });

  it('should reject comment without auth', (done) => {
    scheduleHelper.addComment(null, comment)
      .then(response => {
        expect(response.status).toBe(401);
        done();
      });
  });

  xit('should reject comment for non-existent class', (done) => {
    comment.workoutId = '59700ea79b824126b028943d';
    scheduleHelper.addComment(token, comment)
      .then(response => {
        expect(response.status).toBe(400);
        done();
      });
  });

  it('should save new comment', (done) => {
    scheduleHelper.addComment(token, comment)
      .then(response => {
        expect(response.status).toBe(200);
        expect(response.body.key).toBe('added_comment');
      })
      .then(() => scheduleHelper.getSchedule())
      .then(response => {
        if (!Array.isArray(response.body) || !response.body[0].comments || !response.body[0]) {
          expect(response.body).not.toBeNull();
          expect(response.body[0].comments).not.toBeNull();
          fail('missing comment');

        } else {
          expect(response.body[0].comments.length).toBe(1);
          expect(response.body[0].comments[0].text).toBe('text');
        }
        done();
      });
  });

});
