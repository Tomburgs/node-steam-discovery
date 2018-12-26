const CDiscoveryQueue = require('./index.js');

console.log(CDiscoveryQueue);

CDiscoveryQueue.prototype.login = function(username, passwd, auth){
  let self = this, c = self.SteamTotp.generateAuthCode(auth);
  return new Promise((resolve, reject) => {
    this.community.login({
      accountName: username,
      password: passwd,
      twoFactorCode: c,
      disableMobile: false
    }, (err, sessionID, cookies, steamguard, oAuthToken) => {
      if(err && !cookies)
        return reject(err);
      console.log(`Successfully logged into the Steam Community network as ${username} with auth code ${c}.`);
      self.steamcookies = cookies;
      return resolve([sessionID, cookies]);
    });
  });
}
