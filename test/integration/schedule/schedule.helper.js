let agent;

exports.init = a => {
  agent = a;
};

exports.getSchedule = () => agent
  .get('/schedule')
  .send();

exports.addComment = (authToken, comment) => agent
  .post('/schedule/comment')
  .set('Authorization', 'bearer ' + authToken)
  .send({comment});
