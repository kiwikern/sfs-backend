let agent;

exports.init = a => {
  agent = a;
}

exports.getSync = (authToken) => agent
  .get('/sync')
  .set('Authorization', 'bearer ' + authToken)
  .send();


exports.postSync = (authToken, syncState) => agent
  .post('/sync')
  .set('Authorization', 'bearer ' + authToken)
  .send(syncState);
