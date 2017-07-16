let agent;

exports.init = a => {
  agent = a;
};

exports.register = user => {
  return agent.post('/user').send(user);
};

exports.login = user => {
  return agent.post('/user/session').send(user);
};

exports.requestPasswordReset = user => {
  return agent.post('/user/request-reset-password').send(user);
};

exports.resetPassword = (authToken, password) => {
  return agent.post('/user/reset-password')
    .set('Authorization', 'bearer ' + authToken)
    .send({password});
};
