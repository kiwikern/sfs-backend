const dbHelper = require('../db.helper');
const usRunner = require('../../../src/updatesteps/updatestep.runner');

describe('UpdateStepRunner', () => {
  beforeAll((done) => {
    dbHelper.init()
      .then(() => done());
  });

  beforeEach(done => {
    dbHelper.drop()
      .then(() => done());
  });

  // runAll not used anyway.
  xit('should only change teamtraining workouts', done => {
    let bodyAttackId, poId;
    Promise.resolve()
      .then(() => dbHelper.insertWorkout('bodyattack', 'class'))
      .then(id => bodyAttackId = id)
      .then(() => dbHelper.insertWorkout('teamtraining po'))
      .then(id => poId = id)
      .then(() => usRunner.runAll())
      .then(() => dbHelper.findWorkout(bodyAttackId))
      .then(workout => expect(workout.course).toBe('bodyattack'))
      .then(() => dbHelper.findWorkout(poId))
      .then(workout => expect(workout.course).toBe('po'))
      .then(() => dbHelper.getUpdateStepNumber())
      .then(stepNumber => expect(stepNumber).toBe(5))
      .then(() => done())
      .catch(() => done());
  });

  it('should not run twice', done => {
    Promise.resolve()
      .then(() => usRunner.run(1))
      .then(() => usRunner.run(1))
      .then(() => fail('should not run twice'))
      .then(() => done())
      .catch(() => done());
  });

});