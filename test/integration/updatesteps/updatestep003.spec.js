const dbHelper = require('../db.helper');
const usRunner = require('../../../src/updatesteps/updatestep.runner');

describe('UpdateStep003', () => {
  beforeAll((done) => {
    dbHelper.init()
      .then(() => done());
  });

  beforeEach(done => {
    dbHelper.drop()
      .then(() => done());
  });

  it('should only change cx worx', done => {
    let bodyPumpId, cxWorxId;
    Promise.resolve()
      .then(() => dbHelper.insertWorkout('bodypump', 'class'))
      .then(id => bodyPumpId = id)
      .then(() => dbHelper.insertWorkout('cx worx', 'class'))
      .then(id => cxWorxId = id)
      .then(() => usRunner.run(3))
      .then(() => dbHelper.findWorkout(bodyPumpId))
      .then(workout => expect(workout.course).toBe('bodypump'))
      .then(() => dbHelper.findWorkout(cxWorxId))
      .then(workout => expect(workout.course).toBe('CXWORX'))
      .then(() => done());
  });

});