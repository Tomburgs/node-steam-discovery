const DiscoveryQueue = require('./lib/CDiscoveryQueue');
const Steam = require('./lib/steam');
const master = require('./cfg.json').admin
const bots = require('./cfg.json').profiles;

bots.forEach(obj => {
  let steam = new Steam(obj.username, obj.password, obj.secrets.shared, obj.secrets.identity, master), discovery;
  steam.on('ready', (u, sessionID, cookies) => {
  	if(u === obj.username){
  		discovery = new DiscoveryQueue(sessionID, cookies);
    	farm();
  	}
  });

  function farm(){
    let c = !1;
    discovery.checkCardsLeft()
    .then(moar => {
      if(moar){
        discovery.generateNewQueue()
        .then((apps) => {
          log(`Going through ${apps.length} apps...`);
          return discovery.queue(apps);
        })
        .then(() => {
          log('Done with apps, checking for more...');
          // Set a small break, so that FBI doesn't show up.
          c = !0;
          return setTimeout(farm, 5e3);
        })
        .catch(e => {
          if(!c)
          log(e);
        });
      } else {
        log('No cards left.');
        log('Sending trade-offer...');
        c = !0;
        steam.withdraw();
      }
    })
    .catch(e => {
      if(!c)
      log(`Failed to check if there are any cards left. ${e}`);
    });

    // Call the farm function again an hour later.
    return setTimeout(farm, 36e5);
  }

  function log(txt){
    console.log(`[${obj.username}] - ${txt}`);
  }
});
