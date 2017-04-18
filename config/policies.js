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

    BottleController: {
        find: ['jwtAuth'],
        findOne: ['jwtAuth'],
        create: ['jwtAuth'],
        update: ['jwtAuth'],
        destroy: ['jwtAuth'],
    },

    BottleActionController: {
        find: ['jwtAuth'],
        findOne: ['jwtAuth'],
        create: ['jwtAuth'],
    },

    MessageController: {
        find: ['jwtAuth'],
        create:  ['jwtAuth'],
        getChannels:  ['jwtAuth'],
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
    },

    TeamController: {
        find: ['jwtAuth'],
        findOne: ['jwtAuth'],
        create:  ['jwtAuth'],
        update:  ['jwtAuth'],
        destroy:  ['jwtAuth'],
    },

    AlertController: {
        find: ['jwtAuth'],
        update:  ['jwtAuth'],
        addUser:  ['jwtAuth'],
        removeUser:  ['jwtAuth'],
    },

    AlertButtonController: {
        find: ['jwtAuth'],
        create:  ['jwtAuth'],
        update:  ['jwtAuth'],
        createAlert:  ['jwtAuth'],
        destroy: ['jwtAuth']
    },

    BarrelTypeController: {
        find: ['jwtAuth'],
        create:  ['jwtAuth'],
        update:  ['jwtAuth'],
        destroy:  ['jwtAuth'],
        createBarrel:  ['jwtAuth'],
    },

    BarrelController: {
        find: ['jwtAuth'],
        update:  ['jwtAuth'],
        destroy:  ['jwtAuth']
    }

};
