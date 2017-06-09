const rewire = require('rewire');
const syncSetter = rewire('../../sync/sync.setter.js');

describe(`SyncSetter`, () => {
  let ctx;
  beforeEach(() => {
    ctx = {response: {}, state: {user: {id: 1}}, request: {body: {lastUpdate: 1, state: 2}}};
  });

  it('should return 400 without body', () => {
    ctx.request = {};
    syncSetter.postSyncStatus(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('missing_body');
  });

  it('should return 400 with empty body', () => {
    ctx.request.body = {};
    syncSetter.postSyncStatus(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('missing_lastupdate');
  });

  it('should return 400 without state', () => {
    ctx.request.body.state = null;
    syncSetter.postSyncStatus(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('missing_state');
  });

  it('should return 400 without state', () => {
    ctx.request.body.lastUpdate = null;
    syncSetter.postSyncStatus(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('missing_lastupdate');
  });

  it('should return 400 without userid', () => {
    ctx.state.user = {};
    syncSetter.postSyncStatus(ctx);
    expect(ctx.response.status).toBe(400);
    expect(ctx.response.body.key).toBe('missing_userid');
  });

  it('should return 200 when no state is found', (done) => {
    syncSetter.__set__(getServiceMock(1, false));
    syncSetter.postSyncStatus(ctx).then(() => {
      expect(ctx.response.status).toBe(200);
      expect(ctx.response.body.lastUpdate).toBe(2);
      done();
    });
  });

  it('should return 200 when state is found and lastUpdate equal', (done) => {
    syncSetter.__set__(getServiceMock(1, true));
    syncSetter.postSyncStatus(ctx).then(() => {
      expect(ctx.response.status).toBe(200);
      expect(ctx.response.body.lastUpdate).toBe(2);
      done();
    });
  });

  it('should return 409 when state is found and lastUpdate not equal', (done) => {
    syncSetter.__set__(getServiceMock(5, true));
    syncSetter.postSyncStatus(ctx).then(() => {
      expect(ctx.response.status).toBe(409);
      expect(ctx.response.body.key).toBe('sync_conflict');
      done();
    });
  });

  it('should return 500 on database error', (done) => {
    let logResult;
    log = result => logResult = result;
    syncSetter.__set__(getServiceErrorMock('error', log));
    syncSetter.postSyncStatus(ctx).then(() => {
      expect(ctx.response.status).toBe(500);
      expect(ctx.response.body).toBe(undefined);
      expect(logResult).toBe('error');
      done();
    });
  });

  function getServiceMock(lastUpdate, doReturnFirst) {
    let count = 0;
    return {
      syncService: {
        findState: () => {
          count++;
          if (count == 1) {
            const result = doReturnFirst ? {lastUpdate} : null;
            return Promise.resolve(result);
          } else {
            return Promise.resolve({lastUpdate: lastUpdate + 1});
          }
        },
        addState: () => Promise.resolve()
      }
    };
  }

  function getServiceErrorMock(error, log) {
    return {
    syncService: {
      findState: () => Promise.reject(error),
      addState: () => Promise.resolve()
    },
    console: {log}
    }
  }

});
