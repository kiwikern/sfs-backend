const pushService = require('./push.service.js');

exports.saveSubscription = (ctx) => {
  if (isValidSubscriptionRequest(ctx)) {
    const subscription = createSubscription(ctx.request.body);
    return pushService.addSubscription(subscription)
      .then(() => sendSuccessMessage(ctx))
      .catch((err) => sendErrorMessage(ctx));
  }
}

function createSubscription(subscription) {
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth
    }
  }
};

function isValidSubscriptionRequest(ctx) {
  if (!ctx.request.body.endpoint) {
    ctx.response.status = 400;
    let error = { key: 'no-endpoint' };
    ctx.response.body = error;
    return false;
  } else {
    return true;
  }
}

function sendSuccessMessage(ctx) {
  console.log('successfully added subscription');
  ctx.status = 200;
}

function sendErrorMessage(ctx) {
  const error = {
    error: {
      id: 'unable-to-save-subscription',
      message: 'The subscription was received but could not be stored.'
    }
  };
  ctx.body = JSON.stringify(errorMessage);
  ctx.status = 500;

}
