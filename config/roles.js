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
 * - chat/talk : Send/read message to/from your team channel
 * - chat/talk-to-groups : Send/read message to/from each groups channels
 * - chat/talk-to-teams : Send/read message to/from each teams channels
 * - chat/talk-to-myself : Send/read message to AND from me which cannot be read by another team
 */

module.exports.roles = {
    admin: [
        'auth/as',
        'chat/talk',
        'chat/talk-to-groups',
        'chat/talk-to-teams',
        'chat/talk-to-myself',
    ],
    bar: [
        'chat/talk',
    ],
    log: [
        'chat/talk',
        'chat/talk-to-groups',
        'chat/talk-to-teams',
    ],
};
