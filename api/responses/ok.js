/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 *
 * @param  {Object} data
 */

module.exports = function sendOK (data, options) {
    if(typeof data !== 'object') {
        throw new TypeError('`data` should be an object');
    }

    return this.res.json(200, data);
};
