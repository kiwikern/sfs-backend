const dbHelper = require('../db.helper');
const usRunner = require('../../../src/updatesteps/updatestep.runner');

describe('UpdateStep002', () => {
  beforeAll((done) => {
    dbHelper.init()
      .then(() => done());
  });

  beforeEach(done => {
    dbHelper.drop()
      .then(() => done());
  });

  it('should only change bodypump 45 and twerkout', done => {
    let bodyPumpId, bodyPump45Id, twerkOutId;
    Promise.resolve()
      .then(() => dbHelper.insertWorkout('bodypump', 'class'))
      .then(id => bodyPumpId = id)
      .then(() => dbHelper.insertWorkout('bodypump 45', 'class'))
      .then(id => bodyPump45Id = id)
      .then(() => dbHelper.insertWorkout('twerkout', 'class'))
      .then(id => twerkOutId = id)
      .then(() => usRunner.run(2))
      .then(() => dbHelper.findWorkout(bodyPumpId))
      .then(workout => expect(workout.course).toBe('bodypump'))
      .then(() => dbHelper.findWorkout(bodyPump45Id))
      .then(workout => expect(workout.course).toBe('BodyPump 45'))
      .then(() => dbHelper.findWorkout(twerkOutId))
      .then(workout => expect(workout.course).toBe('TwerkOut'))
      .then(() => done());
  });

});