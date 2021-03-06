const rewire = require('rewire');
const scheduleParser = rewire('../../../src/schedule/schedule.parser.js');

xdescribe(`ScheduleParser`, () => {
  beforeEach(() => {
  });

  it('should parse html', (done) => {
    let classes;
    const getClassesFn = result => classes = result;
    scheduleParser.__set__(getMock(getClassesFn));
    scheduleParser.parseCourses().then(res => {
      expect(classes.length).toBe(8);
      expect(classes[0].time).toBe('09:00');
      expect(classes[1].time).toBe('10:00');
      expect(classes[2].course).toBe('bodyattack');
      expect(classes[3].course).toBe('bodypump');
      expect(classes[4].day).toBe('0');
      expect(classes[5].day).toBe('0');
      expect(classes[6].studio).toBe('europa');
      expect(classes[1].studio).toBe('steglitz');
      done();
    });
  });

  function getMock(getResultFn) {
    return {
      fetch: () => Promise.resolve({text: () => getHTML()}),
      config: {studios: ['steglitz', 'europa'], days: ['mo', 'di'], baseUrl: '', types: ['']},
      scheduleService: {
        getLatestSchedule: () => Promise.resolve([]),
        addSchedule: schedule => {getResultFn(schedule); return Promise.resolve({insertedId: 0});}
      },
      workoutService: {
        addWorkouts: s => s
      },
      changesService: {
        getRecentChanges: () => Promise.resolve(),
        addChange: () => Promise.resolve()
      }
    };
  }

  function getServiceErrorMock(error, log) {
    return {
      syncService: {findState: () => Promise.reject(error)},
      console: {log},
      scheduleService: {getLatestSchedule: () => Promise.resolve()},
    };
  }


});
