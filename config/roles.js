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
 * - developer/refresh : Can request a refresh of all browser which have an open socket
 *
 * - errorLog/read : Read log entries (every user can post)
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
 * - alert/nullReceiver : Will see automatic alert with null receiver
 * - Note on ui : Chat is always avaiable
 * - ui/myspace : Can see the myspace panel (necessary to send alert via buttons)
 * - ui/chatmenu : Can see the chat menu (note: chat is always available to authenticated users)
 * - ui/stockReceiver : Can receive barrel and bottles and see the stock module on myspace
 * - ui/alertReceiver : Can receive alerts and see the admin alert module
 * - ui/overview : Can see overview page
 * - ui/stocks : Can see stocks page
 * - ui/admin : Can see administration menu
 * - ui/admin/teams : Can see teams in administration mneu
 * - ui/admin/barrels : Can see barrels in administration mneu
 * - ui/admin/bottles : Can see bottles in administration mneu
 * - ui/admin/alertbuttons : Can see alertbuttons in administration mneu
 * - ui/admin/developer : Can see developer in administration mneu
 *
 * - user/read : Can read all users
 * - user/team : Require `user/read`. Can create, update or delete user to/from it own team
 * - user/admin : Can read/write on all users
 *
 * - session/read : Can read current active sessions
 */


module.exports = {
    'Espace orga': [
        'alert/restrictedSender',
        'alertButton/read',
        'alertButton/createAlert',
        'barrel/restricted',
        'barrelType/read',
        'bottleAction/restricted',
        'bottleType/read',
        'message/oneChannel',
        'team/read',
        'user/read',
        'ui/myspace',
        'ui/chatmenu',
    ],
    'Bar': [
        'alert/restrictedSender',
        'alertButton/read',
        'alertButton/createAlert',
        'barrel/restricted',
        'barrelType/read',
        'bottleAction/restricted',
        'bottleType/read',
        'message/oneChannel',
        'team/read',
        'user/read',
        'ui/stockReceiver',
        'ui/myspace',
        'ui/stockReceiver',
    ],
    'Orga': [
        'message/public',
        'team/read',
        'user/read',
        'ui/chatmenu',
    ],
    'Logistique': [
        'alert/restrictedReceiver',
        'alertButton/admin',
        'barrel/admin',
        'barrelType/admin',
        'bottleAction/admin',
        'bottleType/admin',
        'message/public',
        'message/group',
        'team/read',
        'alert/nullReceiver',
        'user/team',
        'session/read',
        'user/read',
        'ui/chatmenu',
        'ui/alertReceiver',
        'ui/overview',
        'ui/stocks',
        'ui/admin',
        'ui/admin/teams',
        'ui/admin/barrels',
        'ui/admin/bottles',
        'ui/admin/alertbuttons',
    ],
    'Receuveur d\'alerte': [
        'alert/restrictedReceiver',
        'alertButton/read',
        'message/public',
        'message/group',
        'message/private',
        'team/read',
        'user/team',
        'user/read',
        'ui/chatmenu',
        'ui/alertReceiver',
        'ui/admin',
        'ui/admin/teams',
    ],
    'Coord': [
        'alert/admin',
        'alertButton/admin',
        'barrel/admin',
        'barrelType/admin',
        'bottleAction/admin',
        'bottleType/admin',
        'message/private',
        'message/admin',
        'team/admin',
        'user/admin',
        'session/read',
        'ui/chatmenu',
        'ui/alertReceiver',
        'ui/overview',
        'ui/stocks',
        'ui/admin',
        'ui/admin/teams',
        'ui/admin/barrels',
        'ui/admin/bottles',
        'ui/admin/alertbuttons',
    ],
    'Développeur': [
        'alert/admin',
        'alertButton/admin',
        'auth/as',
        'barrel/admin',
        'barrelType/admin',
        'bottleAction/admin',
        'bottleType/admin',
        'message/private',
        'message/admin',
        'team/admin',
        'user/admin',
        'session/read',
        'developer/refresh',
        'ui/myspace',
        'ui/chatmenu',
        'ui/stockReceiver',
        'ui/alertReceiver',
        'ui/overview',
        'ui/stocks',
        'ui/admin',
        'ui/admin/teams',
        'ui/admin/barrels',
        'ui/admin/bottles',
        'ui/admin/alertbuttons',
        'ui/admin/developer',
    ]
};
