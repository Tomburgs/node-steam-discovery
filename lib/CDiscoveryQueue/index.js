module.exports = CDiscoveryQueue;

const cheerio = require('cheerio');
const request = require('request');

const ERR_NO_RESPONSE = 'No response.';
const ERR_NOT_LOGGED_IN = 'Not logged in.';
const ERR_NO_QUEUE_GENERATED = 'No queue generated.';
const ERR_NO_NEXT_QUEUE = 'No next in queue.';

const METHOD_POST = 'POST';
const METHOD_GET = 'GET';

function CDiscoveryQueue(sessionID, cookies) {
    this.sessionID = sessionID;
    this.steamcookies = [...cookies, 'queue_type=0'];
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
                reject(err);
                return;
            }

            const $ = cheerio.load(body);
            const nextInQueue = $('#next_in_queue_form');
            const url = nextInQueue.attr('action');
            const snr = nextInQueue.children('input[name="snr"]').val()

            this.snr = snr;
            this.initial_url = url;

            resolve(snr);
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
                reject(err);
                return;
            }

            if (!body || !body.queue) {
                reject(ERR_NO_RESPONSE);
                return;
            }

            this.apps = body.queue;
            this._startNew().then(
                () => resolve(body.queue),
                err => reject(err)
            );
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
                reject(err);
                return;
            }

            if (!body) {
                reject(ERR_NO_RESPONSE);
                return;
            }


            const $ = cheerio.load(body);
            const nextInQueue = $('#next_in_queue_form');
            const nextUrl = nextInQueue.attr('action');

            if (nextInQueue.length === 0) {
                return reject(ERR_NO_NEXT_QUEUE);
            }

            resolve(nextUrl);
        });
    });
}

CDiscoveryQueue.prototype.queue = function() {
    if (!this.apps || this.apps.length === 0) {
        return Promise.reject(ERR_NO_QUEUE_GENERATED);
    }

    return new Promise(async (resolve, reject) => {
        try {
            const apps = [initial_appid] = this.apps;
            const urls = [this.initial_url];

            for (const appid of apps) {
                await sleep(2000);

                const index = apps.indexOf(appid);
                const url = urls[index];
                const nextUrl = await this._send(url, appid);

                urls.push(nextUrl);
            }

            resolve();
        } catch (err) {
            if (err === ERR_NO_RESPONSE && apps.indexOf(appid) + 1 === apps.length) {
                this.initial_appid = null;
                this.snr = null;

                resolve();
                return;
            }

            reject(err);
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

require('./login.js');
