const syncService = require('./sync-service.js');

exports.postSyncStatus = (ctx) => {
  if (!isValidRequest(ctx)) {
    return false;
  }
  const userid = ctx.state.user.id;
  return syncService.findState({userid})
    .then(state => {
      if (state && state.lastUpdate !== ctx.request.body.lastUpdate) {
        console.log('isEqual: ' + state.lastUpdate !== ctx.request.body.lastUpdate)
        console.log('===DB STATE===')
        console.log(state)
        console.log('===REQ STATE===')
        console.log(ctx.request.body)
        ctx.response.body = {key: 'sync_conflict'};
        ctx.response.status = 409;
        return;
      } else {
        const token = ctx.state.user;
        const state = ctx.request.body.state;
        const newState = {userid: token.id, state, lastUpdate: Date.now()};
        return syncService.addState(newState)
          .then(() => syncService.findState({userid}))
          .then(state => {
            ctx.response.state = 200;
            ctx.response.body = {lastUpdate: state.lastUpdate};
          });
      }
    })
};

function isValidRequest(ctx) {
  const body = ctx.request.body;
  if (!body) {
    ctx.response.body = "{key: 'missing_body'}";
    ctx.response.status = 400;
    return false
  }
  if (!body.lastUpdate && body.lastUpdate !== 0) {
    ctx.body = "{missing_lastupdate}";
    ctx.response.status = 400;
    return false;
  }
  if (!body.state) {
    ctx.body = "{missing_state}";
    ctx.response.status = 400;
    return false;
  }
  return true;
}
