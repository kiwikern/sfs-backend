const pushService = require('./push.service.js');
const log = require('../logger/logger.instance').getLogger('PushSaver');

exports.saveSubscription = (ctx) => {
  if (isValidSubscriptionRequest(ctx)) {
    const subscription = createSubscription(ctx.request.body);
    return pushService.addSubscription(subscription)
      .then(() => sendSuccessMessage(ctx))
      .catch((err) => sendErrorMessage(ctx));
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
  if (!ctx.request.body.endpoint) {
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

function sendErrorMessage(ctx) {
  log.warn('could not save subscription', {body: ctx.request.body});
  const error = {
    error: {
      id: 'unable-to-save-subscription',
      message: 'The subscription was received but could not be stored.'
    }
  };
  ctx.body = JSON.stringify(error);
  ctx.status = 500;

}
