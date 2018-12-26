module.exports = Steam;
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const SteamTradeManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');
const events = require('events');

function Steam(username, passwd, auth, conf, admin){
  this.client = new SteamUser({"promptSteamGuardCode": false});
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

Steam.prototype._login = function(user, passwd, auth){
  let self = this;

  this.client.logOn({
    accountName: user,
    password: passwd,
    twoFactorCode: SteamTotp.generateAuthCode(auth)
  });

  this.client.on('loggedOn', details => {
    self.client.setPersona(0);
    self.id64 = self.client.steamID;
    self.log(`Logged in!`);
    return self._setCookies(user);
  });

  // You can't catch me, I'll be gone by the time they come.
  this.client.on('steamGuard', (domain, callback, lastCodeWrong) => {
		if(lastCodeWrong) {
			setTimeout(() => {
				callback(SteamTotp.generateAuthCode(auth, 30));
			}, 5000);
		}
	});
}

Steam.prototype._setCookies = function(user){
	let self = this;

	this.client.on('webSession', (sessionID, cookies) => {
	  self.manager.setCookies(cookies, err => {
	    if(err){
	      console.error(err);
	      process.exit(1);
	    }
	  });
	  self.community.setCookies(cookies);

    self.emit('ready', user, sessionID, cookies);
	});
}

require('./tradeoffers.js');
