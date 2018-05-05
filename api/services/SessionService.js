const Flux = require('../../Flux');
const Jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');

/**
 * SessionService - Set of function usefull for checking and generating sessions and jwt
 */
class SessionService {

    /**
     * create - Generate a new jwt for the given user. Call this method only if
     * the authenticated user didn't gave you a jwt. Some session can be replaced
     * like sessions with same deviceId or same socketId.
     *
     * @param  {User} user The user  associated with this session
     * @param  {string} ip Required ip from which the user the connect
     * @param  {Socket} socket Socket object if its a socket connection
     * @param  {string} deviceId device id if its a smartphone
     * @param  {string} firebaseToken firebaseToken if its a smartphone
     * @param  {int} oldSessionId facultative session to be replaced
     * @return {Promise} A promise to the generated JWT
     */
    static create(user, ip, socket, deviceId, firebaseToken, oldSessionId) {
        if(!user) {
            return Promise.reject(new Error('User is null'));
        }

        // Subscribe this socket to the user-specific room
        // (to update user perences for instance)
        socket.join('user:' + user.id);

        // Delete session to be replaced
        let or = [];
        if(socket.id) or.push({socketId: socket.id});
        if(deviceId) or.push({deviceId: deviceId});
        if(firebaseToken) or.push({firebaseToken: firebaseToken});
        let where = {};

        if(or.length) {
            where.$or = or;
        }

        return Flux.Session.destroy({where})
        .then((found) => {

            // Create new session
            let session = Flux.Session.build({
                userId: user.id,
                ip,
                socketId: socket.id,
                deviceId,
                firebaseToken,
            });
            return session.save();
        })
        .then(session => {
            // Generate jwt with the new session
            let jwt = Jwt.sign(
                {
                    userId: user.id,
                    sessionId: session.id,
                },
                Flux.config.jwt.secret,
                { expiresIn: Flux.config.jwt.expiresIn }
            );

            return Promise.resolve(jwt);
        });
    }

    /**
     * check - Assyncronously verify JWT validity, update last session action and return associated user
     *
     * @param  {string} jwt The JWT to test
     * @return {Promise}    The promise that will give associated user on success
     */
    static check(jwt) {
        return new Promise((resolve, reject) => {

            Jwt.verify(jwt, Flux.config.jwt.secret, (error, decoded) => {
                if(error) {
                    return reject(error);
                }
                resolve(decoded);
            });
        });
    }

    /**
     * update session : last action, ip, etc
     *
     * @param  {Session} session Session to update
     * @param  {int} userId The user id associated with this session
     * @param  {string} ip Required ip from which the user the connect
     * @param  {string} socketId Socket id if its a socket connection
     * @param  {string} deviceId device id if its a smartphone
     * @param  {string} firebaseToken firebaseToken if its a smartphone
     * @return {Promise} A promise to the generated JWT
     */
    static update(session, userId, ip, socketId, deviceId, firebaseToken) {
        session.userId = userId;
        session.ip = ip;
        session.socketId = socketId;
        session.deviceId = deviceId;
        session.firebaseToken = firebaseToken;
        session.lastAction = new Date();

        return session.save();
    }

    /**
     * disconnect : Called when connexion is lost or when user ask to log out
     *
     * @param  {Session} session Session to disconnect
     */
    static disconnect(session) {
        session.disconnectedAt = new Date();
        return session.save();
    }


}

module.exports = SessionService;
