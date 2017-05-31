const Flux = require('./Flux');

Flux.start()
.then(() => {
    // Clean sessions disconnected on the last server shutdown
    Flux.Session.update({disconnectedAt: new Date()}, { where: {disconnectedAt: null} })
    .catch((error) => {
        Flux.log.error('Error while trying to clean disconnected sessions');
        Flux.log.error(error);
    });

    // Regularly try to clean timeout sessions
    // (Not so often because it's only needed for HTTP sessions
    // or if socket disconnection event didn't fire)
    setInterval(() => {
        let expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() - 90);

        Flux.Session.findAll({ where: {disconnectedAt: null, lastAction: { lt: expiration } }})
        .then((sessions) => {
            for (let session of sessions) {
                // If it's not socket, set disconnected
                if(!Flux.io.sockets.connected[session.socketId]) {
                    session.disconnectedAt = new Date();
                    session.save()
                    .catch(error => {
                        Flux.log.warn('Error while trying set a session as disconnected');
                        Flux.log.warn(error);
                    });
                }
            }
        })
        .catch(error => {
            Flux.log.warn('Error while trying to clean sessions');
            Flux.log.warn(error);
        });
    }, 60000);

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
