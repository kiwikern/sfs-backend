let agent;

exports.init = a => {
  agent = a;
}

exports.savePushSubscription = subscription => agent
  .post('/subscription')
  .send(subscription);

exports.sendPush = () => agent
  .get('/subscription/send');
