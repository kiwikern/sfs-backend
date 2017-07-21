const router = require('koa-router')();
const feedbackSetter = require('./feedback.setter');
const feedbackGetter = require('./feedback.getter');
const feedbackResponder = require('./feedback.responder');
const feedbackMarker = require('./feedback.marker');

exports.routes = () => router.routes();

router.post('/', ctx => feedbackSetter.saveFeedback(ctx));
router.get('/:userId', ctx => feedbackGetter.getFeedback(ctx));

router.post('/response', ctx => feedbackResponder.saveResponse(ctx));
router.post('/markread', ctx => feedbackMarker.markRead(ctx));