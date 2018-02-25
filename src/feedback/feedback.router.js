const router = require('koa-router')();
const feedbackSetter = require('./feedback.setter');
const feedbackGetter = require('./feedback.getter');
const feedbackResponder = require('./feedback.responder');
const feedbackMarker = require('./feedback.marker');
const auth = require('../user/auth.middlewear');

exports.routes = () => router.routes();

router.post('/', ctx => feedbackSetter.saveFeedback(ctx));
router.get('/', auth.getAuth(), ctx => feedbackGetter.getAllFeedback(ctx));
router.get('/:userId', ctx => feedbackGetter.getFeedback(ctx));

router.post('/response', auth.getTokenWithoutAuth(), ctx => feedbackResponder.saveResponse(ctx));
router.post('/markread', auth.getTokenWithoutAuth(), ctx => feedbackMarker.markRead(ctx));