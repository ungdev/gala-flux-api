module.exports = {
    'get /alert': { action: 'AlertController.find', middlewares: ['auth', 'requireAuth'] },
    'put /alert/:id': { action: 'AlertController.update', middlewares: ['auth', 'requireAuth'] },
    // 'post /alert': { action: 'AlertController.create', middlewares: ['auth', 'requireAuth'] },
    'delete /alert/:id': { action: 'AlertController.update', middlewares: ['auth', 'requireAuth'] },

    'put /alert/:id/users': { action: 'AlertController.updateAssignedUsers', middlewares: ['auth', 'requireAuth'] },
    'post /alert/subscribe': { action: 'AlertController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /alert/unsubscribe': { action: 'AlertController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'post /alertbutton/alert': { action: 'AlertButtonController.createAlert', middlewares: ['auth', 'requireAuth'] },
    'post /alertbutton/subscribe': { action: 'AlertButtonController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /alertbutton/unsubscribe': { action: 'AlertButtonController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'post /login/ip': { action: 'AuthController.ipLogin' },
    'get  /login/oauth': { action: 'AuthController.oauthLogin' },
    'post /login/oauth/submit': { action: 'AuthController.oauthLoginSubmit' },
    'post /login/jwt': { action: 'AuthController.jwtLogin' },
    'get  /login/roles': { action: 'AuthController.getRoles', middlewares: ['auth', 'requireAuth'] },
    'post /login/as/:id': { action: 'AuthController.loginAs', middlewares: ['auth', 'requireAuth'] },
    'post /logout': { action: 'AuthController.logout', middlewares: ['auth', 'requireAuth'] },

    'put /barrel/location': { action: 'BarrelController.setLocation', middlewares: ['auth', 'requireAuth'] },
    'post /barrel/subscribe': { action: 'BarrelController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /barrel/unsubscribe': { action: 'BarrelController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'post /barreltype/barrel': { action: 'BarrelTypeController.setBarrelNumber', middlewares: ['auth', 'requireAuth'] },
    'post /barreltype/subscribe': { action: 'BarrelTypeController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /barreltype/unsubscribe': { action: 'BarrelTypeController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'post /bottleaction/subscribe': { action: 'BottleActionController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /bottleaction/unsubscribe': { action: 'BottleActionController.unsubscribe', middlewares: ['auth', 'requireAuth'] },
    'get /bottleaction/count': { action: 'BottleActionController.count', middlewares: ['auth', 'requireAuth'] },

    'post /bottletype/subscribe': { action: 'BottleTypeController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /bottletype/unsubscribe': { action: 'BottleTypeController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'post /developer/refresh': { action: 'DeveloperController.refresh', middlewares: ['auth', 'requireAuth'] },

    'get /message/channels': { action: 'MessageController.getChannels', middlewares: ['auth', 'requireAuth'] },
    'post /message/subscribe': { action: 'MessageController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /message/unsubscribe': { action: 'MessageController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'get /team': { action: 'TeamController.find', middlewares: ['auth', 'requireAuth'] },
    'put /team/:id': { action: 'TeamController.update', middlewares: ['auth', 'requireAuth'] },
    'post /team': { action: 'TeamController.create', middlewares: ['auth', 'requireAuth'] },
    'delete /team/:id': { action: 'TeamController.update', middlewares: ['auth', 'requireAuth'] },
    'post /team/subscribe': { action: 'TeamController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /team/unsubscribe': { action: 'TeamController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'get /user': { action: 'UserController.find', middlewares: ['auth', 'requireAuth'] },
    'put /user/:id': { action: 'UserController.update', middlewares: ['auth', 'requireAuth'] },
    'post /user': { action: 'UserController.create', middlewares: ['auth', 'requireAuth'] },
    'delete /user/:id': { action: 'UserController.update', middlewares: ['auth', 'requireAuth'] },
    'get /user/etuutt': { action: 'UserController.etuuttFind', middlewares: ['auth', 'requireAuth'] },
    'get /user/avatar/:id': { action: 'UserController.getAvatar' },
    'post /user/avatar/:id': { action: 'UserController.uploadAvatar', middlewares: ['auth', 'requireAuth'] },
    'post /user/subscribe': { action: 'UserController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /user/unsubscribe': { action: 'UserController.unsubscribe', middlewares: ['auth', 'requireAuth'] },

    'post /session/open': { action: 'SessionController.open', middlewares: ['auth', 'requireAuth'] },
    'post /session/subscribe': { action: 'SessionController.subscribe', middlewares: ['auth', 'requireAuth'] },
    'post /session/unsubscribe': { action: 'SessionController.unsubscribe', middlewares: ['auth', 'requireAuth'] },
};
