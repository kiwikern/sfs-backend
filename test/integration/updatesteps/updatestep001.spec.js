const dbHelper = require('../db.helper');
const usRunner = require('../../../src/updatesteps/updatestep.runner');

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
      .then(() => usRunner.run(1))
      .then(() => dbHelper.findWorkout(bodyAttackId))
      .then(workout => expect(workout.course).toBe('bodyattack'))
      .then(() => dbHelper.findWorkout(poId))
      .then(workout => expect(workout.course).toBe('po'))
      .then(() => done());
  });

});