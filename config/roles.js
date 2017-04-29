/**
 * Roles configuration
 *
 * This file will give permissions to roles.
 * First level keys are roles (admin, bar, log)
 * and second levels values are permission that you can use with
 * `PermissionService.has()`
 *
 * List of permissions:
 * - auth/as : Can generate JWT token for another account (for testing and debug purposes)
 *
 * - message/oneChannel : Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
 * - message/public : Not compatible with `oneChannel`. Can send and receive in any public #[teamname] channel, can also receive and send in its own #group:[groupname] channel
 * - message/group : Require `message/public`. Can send and receive in any #group:[groupname] channel
 * - message/private : Require `message/public`. Can send and receive in its own #private:[teamname] channel
 * - message/admin : Not compatible with `oneChannel`. Send/read message to/from everywhere also private channels
 *
 * - user/read : Can read all users
 * - user/team : Require `user/read`. Can create, update or delete user to/from it own team
 * - user/admin : Can read/write on all users
 *
 * - team/read : Can read all teams
 * - team/admin : Can read/write on all teams
 *
 * - bottle/read : Can read all bottles
 * - bottle/admin : Can read/write on all bottles
 *
 * - barrelType/admin : Can read create update and delete barrel types
 * - barrel/admin : Can update state on any barrel (but not create or delete barrel), read all barrel and read all barrelType
 * - barrel/read : Can read all barrels and barreltype
 * - barrel/restricted : Can update state of barrel located in its own team, read your own barrels and read all barrelType
 *
 * - ui/admin : Can see admin panel. If not set, the user will be thrown on bar interface
 * 
 * - alert/restricted : Can only read and update the active alerts his team sent
 * - alert/read : Can only read the alert for his team
 */


module.exports.roles = {
    bar: [
        'user/read',
        'team/read',
        'message/oneChannel',
        'bottleType/read',
        'bottleAction/read',
        'bottleAction/create',
        'alertButton/read',
        'alertButton/create',
        'barrel/restricted',
        'alert/restricted'
    ],
    log: [
        'message/public',
        'message/group',
        'bottleType/admin',
        'bottleAction/admin',
        'alert/read',
        'alert/update',
        'barrelType/admin',
        'barrel/admin'
    ],
    secutt: [
        'message/public',
        'message/group',
        'message/private',
        'alert/read',
        'alert/update',
        'team/admin',
    ],
    coord: [
        'message/admin',
        'alert/read',
        'alert/update',
        'barrel/admin'
    ],
    admin: [
        'message/admin',
        'user/admin',
        'team/admin',
        'auth/as',
        'bottleType/admin',
        'bottleAction/admin',
        'alertButton/admin',
        'alert/read',
        'alert/update',
        'barrelType/admin',
        'barrel/admin',
        'ui/admin',
    ],
};
