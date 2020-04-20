module.exports = Steam;
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const SteamTradeManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');
const events = require('events');

function Steam(username, passwd, auth, conf, admin) {
    this.client = new SteamUser({ promptSteamGuardCode: false });
    this.community = new SteamCommunity();
    this.manager = new SteamTradeManager({
        steam: this.client,
        community: this.community,
        language: 'en'
    });
    this.log = (txt) => {
        console.log(`[${username}] - ${txt}`);
    }
    this.confirmation = conf;
    this.admin = admin;
    this._login(username, passwd, auth);
}

Steam.prototype = new events.EventEmitter;

Steam.prototype._login = function(accountName, password, auth) {
    this.client.logOn({
        accountName,
        password,
        twoFactorCode: SteamTotp.generateAuthCode(auth)
    });

    this.client.on('loggedOn', () => {
        this.client.setPersona(0);
        this.id64 = this.client.steamID;
        this.log(`Logged in!`);

        return this._setCookies(accountName);
    });

    this.client.on('steamGuard', (_, callback, lastCodeWrong) => {
		if (lastCodeWrong) {
			setTimeout(
                () => callback(SteamTotp.generateAuthCode(auth, 30)),
                5000
            );
		}
	});
}

Steam.prototype._setCookies = function(user) {
	this.client.on('webSession', (sessionID, cookies) => {
        this.manager.setCookies(cookies, err => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });

        this.community.setCookies(cookies);
        this.emit('ready', user, sessionID, cookies);
	});
}

require('./tradeoffers.js');
