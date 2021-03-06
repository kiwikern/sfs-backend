const pushService = require('./push.service.js');
const log = require('../logger/logger.instance').getLogger('PushSaver');

exports.saveSubscription = (ctx) => {
  if (isValidSubscriptionRequest(ctx)) {
    const body = ctx.request.body;
    const subscription = createSubscription(body.subscription);
    return pushService.addSubscription({subscription, userId: body.userId})
      .then(() => sendSuccessMessage(ctx))
      .catch((err) => sendErrorMessage(err, ctx));
  }
};

function createSubscription(subscription) {
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  }
}

function isValidSubscriptionRequest(ctx) {
  if (!ctx.request.body.subscription || !ctx.request.body.subscription.endpoint) {
    log.warn('got invalid subscription request', ctx.request.body);
    ctx.response.status = 400;
    ctx.response.body = {key: 'no-endpoint'};
    return false;
  } else {
    return true;
  }
}

function sendSuccessMessage(ctx) {
  log.silly('successfully added subscription');
  ctx.status = 200;
}

function sendErrorMessage(error, ctx) {
  log.error('could not save subscription', {error, body: ctx.request.body});
  const errorResponse = {
    error: {
      id: 'unable-to-save-subscription',
      message: 'The subscription was received but could not be stored.'
    }
  };
  ctx.body = JSON.stringify(errorResponse);
  ctx.status = 500;

}
