const subscriptionService = require('./database/subscription-service.js');

exports.saveSubscription = (ctx) => {
  if (isValidSubscriptionRequest(ctx)) {
    return subscriptionService.addSubscription(ctx.request.body)
      .then(() => sendSuccessMessage(ctx))
      .catch((err) => sendErrorMessage(ctx));
  }
}

function isValidSubscriptionRequest(ctx) {
  if (!ctx.request.body.endpoint) {
    ctx.response.status = 400;
    let error = {
      error: {
        id: 'no-endpoint',
        message: 'Subscription must have an endpoint.'
      }
    };
    ctx.response.body = JSON.stringify(error);
    return false;
  } else {
    return true;
  }
}

function sendSuccessMessage(ctx) {
  console.log('successfully added subscription');
  const successMessage = {
    data: {
      success: true
    }
  };
  ctx.status = 200;
  ctx.body = JSON.stringify(successMessage);
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
