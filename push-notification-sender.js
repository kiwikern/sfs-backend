const vapidKeys = require('./secrets.js').vapidKeys;
const webpush = require('web-push');

exports.init = () => {
  webpush.setVapidDetails(
    'mailto:sfs@kimkern.de',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log('init');
};

exports.sendPush = () => {
  const subscriptions = [{
      "endpoint": "https://fcm.googleapis.com/fcm/send/dnw68Ydfgl8:APA91bHOyH2LLlZCRo4BjoQwZnP6f4LB9BFYWx_TopaRPnCHqXHVIl6z3Eah9_PTc7U4KkNtLtOYA-YpOkdhzT4G9uHRTrxkN5d3HkIJC6q_ADLcXENfprJeFd801f21GAYLlc1HFUrv",
      "expirationTime": null,
      "keys": {
        "p256dh": "BEefymVErdSeREfDh-B7xMKVc9Y6OgTL-BrkZ2lclX71PyGqXEr_6j-yPNZs67zY1TE9trczJbdunrbNIgZFTeQ=",
        "auth": "hD5L51UygLu7Knnk6LtNyQ=="
      }
    },
    // {
    //   "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABZIawSs8HiZbUGNKbowysBWJG5AyH_2kwet8RaaAwD4u9nxNvNQ28vQrJDeETbpMJUtkR8_fIkXF7fTfKTPh9_g6Y7r6s_C1H69dBmVgEcZETRbboApfyP5KcVyrdYUzCQzViI-No3EiNbRZkmtSkAmzvwYJFrUBrNYEsjA68pL1pUlj0",
    //   "keys": {
    //     "auth": "Lr943c7hwKI99wv-G4T3CQ",
    //     "p256dh": "BP-3PkRT2niX1UMpMVtZZSY8qNFCN2t_TQyn4tUt8l45xH9M9GMlvjso-2UlE9ZnlaXCWXShCxz9T42nih9VUjU"
    //   }
    // }
  ];
  const data = {
    notification: {
      body: 'Der Kursplan hat sich geändert.',
      title: 'Superfit Kursplan',
      icon: 'assets/favicons/android-chrome-192x192.png'
    }
  }
  return subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, JSON.stringify(data))
      .then(success => console.log(success))
      .catch(error => console.log(error));
  });
}
