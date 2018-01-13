const dbHelper = require('../db.helper');
const usRunner = require('../../../src/updatesteps/updatestep.runner');

describe('UpdateStep004', () => {
  beforeAll((done) => {
    dbHelper.init()
      .then(() => done());
  });

  beforeEach(done => {
    dbHelper.drop()
      .then(() => done());
  });

  it('should only change cellulite kiler', done => {
    let bodyPumpId, celluliteId;
    Promise.resolve()
      .then(() => dbHelper.insertWorkout('bodypump', 'class'))
      .then(id => bodyPumpId = id)
      .then(() => dbHelper.insertWorkout('cellulite-killer', 'class'))
      .then(id => celluliteId = id)
      .then(() => usRunner.run(4))
      .then(() => dbHelper.findWorkout(bodyPumpId))
      .then(workout => expect(workout.course).toBe('bodypump'))
      .then(() => dbHelper.findWorkout(celluliteId))
      .then(workout => expect(workout.course).toBe('cellulitekiller'))
      .then(() => done());
  });

});