/**
 * Roles configuration
 *
 * This file will give permissions to roles.
 * First level keys are roles (admin, bar, log)
 * and second levels values are permission that you can use with
 * `PermissionService.has()`
 *
 * List of permissions:
 *
 * - alert/read : Can read all alerts
 * - alert/restrictedSender : Can read and update the active alerts sent by his team
 * - alert/restrictedReceiver : Can read and update the alerts received by his team
 * - alert/admin : Can read/write all alerts
 *
 * - alertButton/read : Can read all buttons
 * - alertButton/createAlert : Can use alert button to create an alert
 * - alertButton/admin : Can Read/write all buttons
 *
 * - auth/as : Can generate JWT token for another account (for testing and debug purposes)
 *
 * - barrel/read : Can read all barrels
 * - barrel/restricted : Can update state of barrel located in its own team, read your own barrels
 * - barrel/admin : Can update state on any barrel, read all barrel
 *
 * - barrelType/read : Can read all barrel types
 * - barrelType/admin : Can read create update and delete barrel types
 *
 * - bottleAction/read : Can read all bottles
 * - bottleAction/restricted :  Can update state of barrel located in its own team, read your own bottles
 * - bottleAction/admin : Can read/write on all bottles
 *
 * - bottleType/read : Can read all bottlesTypes
 * - bottleType/admin : Can read/write on all bottlesTypes
 *
 * - message/oneChannel : Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
 * - message/public : Not compatible with `oneChannel`. Can send and receive in any public #[teamname] channel, can also receive and send in its own #group:[groupname] channel
 * - message/group : Require `message/public`. Can send and receive in any #group:[groupname] channel
 * - message/private : Require `message/public`. Can send and receive in its own #private:[teamname] channel
 * - message/admin : Not compatible with `oneChannel`. Send/read message to/from everywhere also private channels
 *
 * - team/read : Can read all teams
 * - team/admin : Can read/write on all teams
 *
 * - ui/admin : Can see admin panel. If not set, the user will be thrown on bar interface
 *
 * - user/read : Can read all users
 * - user/team : Require `user/read`. Can create, update or delete user to/from it own team
 * - user/admin : Can read/write on all users
 */


module.exports.roles = {
    bar: [
        'user/read',
        'team/read',
        'message/oneChannel',
        'bottleType/read',
        'bottleAction/read',
        'bottleAction/create',
        'barrelType/read',
        'barrel/restricted',
        'alertButton/read',
        'alertButton/createAlert',
        'alert/restrictedSender'
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
        'barrel/admin',
        'barrelType/admin',
        'ui/admin',
    ],
};
