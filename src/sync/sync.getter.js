const syncService = require('./sync.service.js');

exports.getSyncStatus = (ctx) => {
  if (ctx.state.user && ctx.state.user.id) {
    return syncService.findState({userid: ctx.state.user.id})
      .then(state => {
        if (state) {
          ctx.response.status = 200;
          ctx.response.body = state;
        } else {
          ctx.response.status = 200;
          ctx.response.body = {key: 'no_sync_status_found'};
        }
      });
  } else {
    ctx.response.status = 400;
    ctx.response.body = {key: 'no_userid_given'};
  }
}
