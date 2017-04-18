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
 */


module.exports.roles = {
    bar: [
        'message/oneChannel',
        'bottle/read',
        'alertButton/read',
        'alertButton/create',
        'barrel/restricted'
    ],
    log: [
        'message/public',
        'message/group',
        'bottle/read',
        'bottle/admin',
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
        'alert/update'
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
        'bottle/admin',
        'alertButton/admin',
        'alert/read',
        'alert/update',
        'barrelType/admin',
        'barrel/admin'
    ],
};
