let syncService = require('./sync.service.js');
const log = require('../logger/logger.instance').getLogger('SyncGetter');

exports.getSyncStatus = (ctx) => {
  if (ctx.state.user.id) {
    return syncService.findState({userid: ctx.state.user.id})
      .then(state => {
        if (state) {
          ctx.response.status = 200;
          ctx.response.body = state;
        } else {
          ctx.response.status = 200;
          ctx.response.body = {key: 'no_sync_status_found'};
        }
      })
      .catch(error => {
        log.error('could not get sync status', error);
        ctx.response.status = 500;
      });
  } else {
    log.warn('no user id found', ctx.state.user);
    ctx.response.status = 400;
    ctx.response.body = {key: 'no_userid_given'};
  }
};
