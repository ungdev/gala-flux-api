const Flux = require('./Flux');

Flux.start()
.then(() => {
    // Clean sessions disconnected on the last server shutdown
    Flux.Session.update({disconnectedAt: new Date()}, { where: {disconnectedAt: null} })
    .catch((error) => {
        Flux.log.error('Error while trying to clean disconnected sessions');
        Flux.log.error(error);
    });

    // Init firebase
    if(Flux.config.firebase.database) {
        const admin = require("firebase-admin");

        // fix private_key format
        Flux.config.firebase.serviceAccount.private_key = Flux.config.firebase.serviceAccount.private_key.replace(/\\+n/g, '\n');

        Flux.log.info('Init Firebase.');
        admin.initializeApp({
            credential: admin.credential.cert(Flux.config.firebase.serviceAccount),
            databaseURL: 'https://' + Flux.config.firebase.database + '.firebaseio.com'
        });
    }
    else {
        Flux.log.warn('Empty firebase configuration. Push notifications are disabled.');
    }

})
.catch(Flux.log.error);
