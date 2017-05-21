const vapidKeys = require('./secrets.js').vapidKeys;
const webpush = require('web-push');
const databaseService = require('./database-service.js');

exports.init = () => {
  webpush.setVapidDetails(
    'mailto:sfs@kimkern.de',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log('init');
};

exports.sendPush = () => {
  databaseService.getAllSubscriptions().
    then(sendToAllSubscriptions);
};

function sendToAllSubscriptions(subscriptions) {
  console.log(subscriptions.length);
  const data = {
    notification: {
      body: 'Der Kursplan hat sich geändert.',
      title: 'Superfit Kursplan',
      icon: 'assets/favicons/android-chrome-192x192.png'
    }
  }
  return subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, JSON.stringify(data))
      .then(success => console.log('notification sent.'))
      .catch(error => {
        databaseService.deleteSubscription(subscription);
      });
  });
}
