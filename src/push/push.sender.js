const vapidKeys = require('../secrets.js').vapidKeys;
const webpush = require('web-push');
const pushService = require('./push.service.js');
const log = require('../logger/logger.instance').getLogger('PushSender');

exports.init = () => {
  webpush.setVapidDetails(
    'mailto:sfs@kimkern.de',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
};

exports.sendPush = () => {
  pushService.getAllSubscriptions().
    then(sendToAllSubscriptions);
};

function sendToAllSubscriptions(subscriptions) {
  log.info('sending notifications to ' + subscriptions.length + 'clients');
  const data = {
    notification: {
      body: 'Der Kursplan hat sich geändert.',
      title: 'Superfit Kursplan',
      icon: 'assets/favicons/android-chrome-192x192.png',
      data: '/schedule/changes',
      actions: [
        {action: 'openpage', title: 'Änderungen anzeigen', icon: 'assets/ic_swap_horiz_black_24dp_2x.png'}
      ]
    }
  };
  return subscriptions.forEach(subscriptionData => {
    webpush.sendNotification(subscriptionData.subscription, JSON.stringify(data))
      .then(success => log.debug('notification sent.'))
      .catch(error => {
        log.debug('deleting subscription', error);
        pushService.deleteSubscription(subscriptionData._id);
      });
  });
}
