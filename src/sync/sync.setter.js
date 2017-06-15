let syncService = require('./sync.service.js');
let _ = require('lodash');

exports.postSyncStatus = (ctx) => {
  if (!isValidRequest(ctx)) {
    return false;
  }
  const userid = ctx.state.user.id;
  return syncService.findState({userid})
    .then(state => {
      if (state && state.lastUpdate !== ctx.request.body.lastUpdate) {
        ctx.response.body = {key: 'sync_conflict'};
        ctx.response.status = 409;
        return;
      } else {
        const requestState= ctx.request.body.state;
        if (state && state.state && _.isEqual(state.state, requestState)) {
          ctx.response.body = {lastUpdate: state.lastUpdate};
          ctx.response.status = 200;
        } else {
          return saveSyncState(ctx);
        }
        return;
      }
    })
    .catch(error => {
      console.log(error);
      ctx.response.status = 500;
    });
};

function isValidRequest(ctx) {
  const body = ctx.request.body;
  if (!body) {
    ctx.response.body = {key: 'missing_body'};
    ctx.response.status = 400;
    return false
  }
  if (!body.lastUpdate && body.lastUpdate !== 0) {
    ctx.response.body = {key: 'missing_lastupdate'};
    ctx.response.status = 400;
    return false;
  }
  if (!body.state) {
    ctx.response.body = {key: 'missing_state'};
    ctx.response.status = 400;
    return false;
  }
  if (!ctx.state.user.id) {
    ctx.response.body = {key: 'missing_userid'};
    ctx.response.status = 400;
    return false;

  }
  return true;
}

function saveSyncState(ctx) {
  const userid = ctx.state.user.id;
  const state = ctx.request.body.state;
  const newState = {userid, state, lastUpdate: Date.now()};
  return syncService.addState(newState)
    .then(() => syncService.findState({userid}))
    .then(state => {
      ctx.response.status = 200;
      ctx.response.body = {lastUpdate: state.lastUpdate};
    });
}