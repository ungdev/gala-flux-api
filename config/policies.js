/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {
    // Default behavior request authentication
    '*': ['jwtAuth', false],

    AuthController: {
        ipLogin: true,
        oauthLogin: true,
        oauthLoginSubmit: true,
        jwtLogin: true,
        getRoles: ['jwtAuth'],
        loginAs: ['jwtAuth'],
        logout: ['jwtAuth'],
    },

    SessionController: {
        open: ['jwtAuth'],
        find: ["jwtAuth"],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    BottleTypeController: {
        find: ['jwtAuth'],
        findOne: ['jwtAuth'],
        create: ['jwtAuth'],
        update: ['jwtAuth'],
        destroy: ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    BottleActionController: {
        find: ['jwtAuth'],
        findOne: ['jwtAuth'],
        create: ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
        count:  ['jwtAuth'],
    },

    ErrorLogController: {
        find: ['jwtAuth'],
        create: ['jwtAuth'],
    },

    MessageController: {
        find: ['jwtAuth'],
        create:  ['jwtAuth'],
        getChannels:  ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    UserController: {
        find: ['jwtAuth'],
        findOne: ['jwtAuth'],
        create:  ['jwtAuth'],
        update:  ['jwtAuth'],
        destroy:  ['jwtAuth'],
        etuuttFind:  ['jwtAuth'],
        uploadAvatar:  ['jwtAuth'],
        getAvatar:  true,
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    TeamController: {
        find: ['jwtAuth'],
        findOne: ['jwtAuth'],
        create:  ['jwtAuth'],
        update:  ['jwtAuth'],
        destroy:  ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    AlertController: {
        find: ['jwtAuth'],
        update:  ['jwtAuth'],
        updateAssignedUsers:  ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    AlertButtonController: {
        find: ['jwtAuth'],
        create:  ['jwtAuth'],
        update:  ['jwtAuth'],
        createAlert:  ['jwtAuth'],
        destroy: ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    BarrelTypeController: {
        find: ['jwtAuth'],
        create:  ['jwtAuth'],
        update:  ['jwtAuth'],
        destroy:  ['jwtAuth'],
        setBarrelNumber:  ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    },

    BarrelController: {
        find: ['jwtAuth'],
        update:  ['jwtAuth'],
        setLocation:  ['jwtAuth'],
        unsubscribe:  ['jwtAuth'],
        subscribe:  ['jwtAuth'],
    }

};
