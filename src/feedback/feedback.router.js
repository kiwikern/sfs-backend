const router = require('koa-router')();
const feedbackSetter = require('./feedback.setter');
const feedbackGetter = require('./feedback.getter');

exports.routes = () => router.routes();

router.post('/', ctx => feedbackSetter.saveFeedback(ctx));
router.get('/:userId', ctx => feedbackGetter.getFeedback(ctx));