let agent;

exports.init = a => {
  agent = a;
}

exports.register = user => {
  return agent.post('/user').send(user);
}

exports.login = user => {
  return agent.post('/user/session').send(user);
}
