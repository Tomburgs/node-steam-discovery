const CDiscoveryQueue = require('./index.js');

CDiscoveryQueue.prototype.login = function(accountName, password, auth) {
    const twoFactorCode = this.SteamTotp.generateAuthCode(auth);

    return new Promise((resolve, reject) => {
        this.community.login({
            accountName,
            password,
            twoFactorCode,
            disableMobile: false
        }, (err, sessionID, cookies) => {
            if (err && !cookies) {
                return reject(err);
            }

            console.log(`Successfully logged into the Steam Community network as ${accountName} with auth code ${twoFactorCode}.`);

            this.steamcookies = cookies;

            return resolve([sessionID, cookies]);
        });
    });
}
