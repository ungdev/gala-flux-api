const Request = require('request');
const axios = require('axios')
const Url = require('url');
const crypto = require('crypto');

// Only works with version 1.6+
class Buckless {
    constructor(options) {
        this._baseUri = options.baseUri || 'https://api.gala2019.inst.buckless.com/api/v1';
        this._mail = options.mail;
        this._password = options.password;

        this._login();
    }

    _login() {
        const signature = this._generateSignature('POST', 'auth/login')
        return new Promise((resolve, reject) => {
            axios({
                url: `${this._baseUri}/auth/login`,
                method: 'POST',
                data: {
                    mail: this._mail,
                    password: this._password
                },
                headers: {
                    'X-fingerprint': 'admin',
                    'X-signature': signature
                },
            }).then(response => {
                if (response.status == 200) {
                    this._token = response.data.token;
                } else {
                    console.log(response);
                }
            })
            .catch(e => {
              console.log(e)
            })
        })
    }

    _generateSignature(method, url) {
        const path = url.split('?');
        const signaturePayload = `admin-${method}-/${path[0]}`;
        const hmac = crypto.createHmac('sha256', 'admin').update(signaturePayload);
        return hmac.digest('hex');
    }

    _sendRequest(point, endpoint) {
        if (!this._token) {
            return this._login()
                .then(() => this.sendRequest(point, endpoint));
        }

        const url = `stats/${endpoint}?point=${point}`;

        return new Promise((resolve, reject) => {
            Request({
                url: `${this._baseUri}/${url}`,
                method: 'GET',
                headers: {
                    'X-fingerprint': 'admin',
                    'X-signature': this._generateSignature('GET', url),
                    Authorization: `Bearer ${this._token}`
                },
            }, (error, response) => {
                if (!error && response.statusCode == 200) {
                    let object = JSON.parse(response.body);
                    resolve(object);
                } else if(!error) {
                    reject(response);
                } else {
                    reject(error);
                }
            });
        });
    }

    getPurchases(point) {
        return this._sendRequest(point, 'purchases');
    }

    getReloads(point) {
        return this._sendRequest(point, 'reloads');
    }
}

module.exports = Buckless;