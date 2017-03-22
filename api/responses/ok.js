/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 *
 * @param  {Object} data
 */

module.exports = function ok(data) {
    if(typeof data !== 'object') {
        throw new TypeError('`data` should be an object, `' + (typeof data) + '` given');
    }

    return this.res.json(200, data);
};
