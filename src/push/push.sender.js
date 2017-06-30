const vapidKeys = require('../secrets.js').vapidKeys;
const webpush = require('web-push');
const pushService = require('./push.service.js');

exports.init = () => {
  webpush.setVapidDetails(
    'mailto:sfs@kimkern.de',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log('PushNotificationSender: init finished');
};

exports.sendPush = () => {
  pushService.getAllSubscriptions().
    then(sendToAllSubscriptions);
};

function sendToAllSubscriptions(subscriptions) {
  console.log(subscriptions.length);
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
  return subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, JSON.stringify(data))
      .then(success => console.log('notification sent.'))
      .catch(error => {
        console.log(error)
        pushService.deleteSubscription(subscription);
      });
  });
}
