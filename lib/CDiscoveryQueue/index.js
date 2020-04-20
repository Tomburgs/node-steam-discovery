module.exports = CDiscoveryQueue;

const cheerio = require('cheerio');
const request = require('request');

const ERR_NO_RESPONSE = 'No response.';
const ERR_NOT_LOGGED_IN = 'Not logged in.';
const ERR_NO_QUEUE_GENERATED = 'No queue generated.';

const METHOD_POST = 'POST';
const METHOD_GET = 'GET';

function CDiscoveryQueue(sessionID, cookies) {
    this.sessionID = sessionID;
    this.steamcookies = cookies;
}

CDiscoveryQueue.prototype._startNew = function() {
    return new Promise((resolve, reject) => {
        request({
            uri: 'https://store.steampowered.com/explore/startnew',
            headers: {
                cookie: this.steamcookies
            }
        }, (err, _, body) => {
            if (err) {
                return reject(err);
            }

            const $ = cheerio.load(body);
            const snr = $('#next_in_queue_form').children('input[name="snr"]').val();

            this.snr = snr;

            return resolve(snr);
        });
    });
}

CDiscoveryQueue.prototype.generateNewQueue = function() {
    if (!this.steamcookies) {
        return Promise.reject(ERR_NOT_LOGGED_IN);
    }

    return new Promise((resolve, reject) => {
        request({
            uri: 'https://store.steampowered.com/explore/generatenewdiscoveryqueue/',
            headers: {
                cookie: this.steamcookies
            },
            form: {
                queuetype: 0,
                sessionid: this.sessionID
            },
            method: METHOD_POST,
            json: true,
            gzip: true
        }, (err, _, body) => {
            if (err) {
                return reject(err);
            }

            if (body && body.queue) {
                this.apps = body.queue;

                return this._startNew()
                    .then(
                        () => resolve(body.queue),
                        e => reject(e)
                    );
            } else {
                return reject(ERR_NO_RESPONSE);
            }
        });
    });
}

CDiscoveryQueue.prototype._send = function(uri, appid) {
    return new Promise((resolve, reject) => {
        request({
            uri,
            method: METHOD_POST,
            headers: {
                cookie: this.steamcookies
            },
            formData: {
                appid_to_clear_from_queue: appid,
                sessionid: this.sessionID,
                snr: this.snr
            }
        }, (err, _, body) => {
            if (err) {
                return reject(err);
            }

            if (body) {
                const $ = cheerio.load(body);

                return resolve($('#next_in_queue_form').attr('action'));
            } else {
                return reject(ERR_NO_RESPONSE);
            }
        });
    });
}

CDiscoveryQueue.prototype.queue = function() {
    if (!this.apps || this.apps.length === 0) {
        return Promise.reject(ERR_NO_QUEUE_GENERATED);
    }

    return new Promise(async (resolve, reject) => {
        const apps = [initial_appid] = this.apps;
        const initial_load = `https://store.steampowered.com/app/${initial_appid}/`

        for (let i = 0, next = initial_load; i < apps.length; i++) {
            await sleep(1000);

            try {
                const appid = apps[i];

                next = await this._send(next, appid);
            } catch (e) {
                if (e === ERR_NO_RESPONSE && i + 1 === apps.length) {
                    return resolve();
                }

                return reject(e);
            }
        }
    });
}

CDiscoveryQueue.prototype.checkCardsLeft = function() {
    if (!this.steamcookies) {
        return Promise.reject(ERR_NOT_LOGGED_IN);
    }

    return new Promise((resolve, reject) => {
        request({
            uri: 'https://store.steampowered.com/explore/',
            method: METHOD_GET,
            headers: {
                cookie: this.steamcookies
            }
        }, (err, _, body) => {
            if (err) {
                return reject(err);
            }

            if (body && body.includes('Come back tomorrow to earn more cards by browsing your Discovery Queue!')) {
                return resolve(false);
            }

            return resolve(true);
        });
    });
}

const sleep = ms = new Promise(resolve => setTimeout(resolve, ms, null));

require('./login.js');
