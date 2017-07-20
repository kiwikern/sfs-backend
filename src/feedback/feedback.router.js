const router = require('koa-router')();
const feedbackSetter = require('./feedback.setter');
const feedbackGetter = require('./feedback.getter');
const feedbackResponder = require('./feedback.responder');

exports.routes = () => router.routes();

router.post('/', ctx => feedbackSetter.saveFeedback(ctx));
router.get('/:userId', ctx => feedbackGetter.getFeedback(ctx));

router.post('/response', ctx => feedbackResponder.saveResponse(ctx));