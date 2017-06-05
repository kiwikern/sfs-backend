const router = require('koa-router')();

exports.routes = () => router.routes();
exports.allowedMethods = () => router.allowedMethods();

router.get('/', ctx => getSyncStatus(ctx));
router.post('/', ctx => postSyncStatus(ctx));

function getSyncStatus(ctx) {
  const databaseState = {
    lastUpdate: Date.now(),
    filter: {
      maxEndTime: 10
    },
    favorites: {
      workouts: []
    },
    settings: {}
  }
  ctx.body = databaseState;
}

function postSyncStatus(ctx) {
  if (!isValidRequest(ctx)) {
    return false;
  }
  const databaseState = {
    lastUpdate: Date.now()
  }
  ctx.body = databaseState;
}

function isValidRequest(ctx) {
  if (!ctx.request.body) {
    ctx.body = "Missing request body: lastUpdate and state";
    ctx.response.status = 400;
    return false
  }
  const lastUpdate = ctx.request.body.lastUpdate;
  // TODO: get lastUpdate timestamp from db
  const serverLastUpdate = '';
  if (!lastUpdate) {
    ctx.body = "No lastUpdate timestamp given.";
    ctx.response.status = 400;
    return false;
  }
  if (lastUpdate !== serverLastUpdate) {
    ctx.body = "Sync conflict";
    ctx.response.status = 409;
    return false;
  }
  if (!ctx.request.body.state) {
    ctx.body = "Missing state";
    ctx.response.status = 400;
    return false;
  }
  return true;
}
