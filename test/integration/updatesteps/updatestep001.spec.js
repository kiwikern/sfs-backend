const dbHelper = require('../db.helper');
const us = require('../../../src/updatesteps/updatestep001');

describe('User registration and login', () => {
  beforeAll((done) => {
    dbHelper.init()
      .then(() => done());
  });

  beforeEach(done => {
    dbHelper.drop()
      .then(() => done());
  });

  it('should only change teamtraining workouts', done => {
    let bodyAttackId, poId;
    Promise.resolve()
      .then(() => dbHelper.insertWorkout('bodyattack', 'class'))
      .then(id => bodyAttackId = id)
      .then(() => dbHelper.insertWorkout('teamtraining po'))
      .then(id => poId = id)
      .then(() => us.run())
      .then(() => dbHelper.findWorkout(bodyAttackId))
      .then(workout => expect(workout.course).toBe('bodyattack'))
      .then(() => dbHelper.findWorkout(poId))
      .then(workout => expect(workout.course).toBe('po'))
      .then(() => done());
  });

  it('should not run twice', done => {
    let bodyAttackId, poId;
    Promise.resolve()
      .then(() => us.run())
      .then(() => us.run())
      .then(() => fail('should not run twice'))
      .then(() => done())
      .catch(() => done());
  });

});