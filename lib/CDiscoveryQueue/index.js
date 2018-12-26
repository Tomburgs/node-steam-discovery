module.exports = CDiscoveryQueue;

const cheerio = require('cheerio');
const request = require('request');

function CDiscoveryQueue(sessionID, cookies){
  this.sessionID = sessionID;
  this.steamcookies = cookies;
}

CDiscoveryQueue.prototype._startNew = function(){
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://store.steampowered.com/explore/startnew',
      headers: {
        cookie: this.steamcookies
      }
    }, (err, res, body) => {
      if(err)
        return reject(err);

      const $ = cheerio.load(body);
      let snr = $('#next_in_queue_form').children('input[name="snr"]').val();
      this.snr = snr;
      return resolve(snr);
    });
  });
}

CDiscoveryQueue.prototype.generateNewQueue = function(){
  let self = this;
  if(!this.steamcookies){
    return Promise.reject('Not logged in.');
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
      method: "POST",
      json: true,
      gzip: true
    }, (err, res, body) => {
      if(err)
        return reject(err);

      if(body && body.queue){
        this.apps = body.queue;
        self._startNew()
        .then(snr => {
          return resolve(body.queue);
        })
        .catch(e => {
          return reject(e);
        });
      } else {
        return reject('No response.');
      }
    });
  });
}

CDiscoveryQueue.prototype._send = function(url, appid){
  if(!url){
    url = `https://store.steampowered.com/app/${appid}/`;
  }
  return new Promise((resolve, reject) => {
    // Aw, fuck. I can't believe you've done this.
    request({
      uri: url,
      method: "POST",
      headers: {
        cookie: this.steamcookies
      },
      formData: {
        appid_to_clear_from_queue: appid,
        sessionid: this.sessionID,
        snr: this.snr
      }
    }, (err, res, body) => {
      if(err){
        return reject(err);
      }
      /*
      console.log(JSON.stringify({
        appid_to_clear_from_queue: appid,
        sessionid: this.sessionID,
        snr: this.snr
      }, null, 4));
      */
      if(body){
        const $ = cheerio.load(body);
        return resolve($('#next_in_queue_form').attr('action'));
      } else {
        return reject('No response.');
      }
    });
  });
}

CDiscoveryQueue.prototype.queue = function(url){
  let self = this;
  if(!this.apps || this.apps.length === 0){
    return Promise.reject('No queue generated.');
  }

  return new Promise((resolve, reject) => {
    let urls = {}, apps = self.apps;
    for(let i = 0; i < apps.length; i++){
      sleep(1000*i)
      .then(async () => {
        urls[apps[i+1]] = await self._send(urls[apps[i]], apps[i]);
      })
      .catch(e => {
        if(e === 'No response.')
          return Promise.resolve();
        return reject(e);
      })
      .then(() => {
        if(i+1 === apps.length){
          return resolve();
        }
      });
    }
  });
}

// I don't know what kind of stupid name is this.
// It's 8:26 am as of the time of writing this.
// It's 24th of december. Christmas morning.
// I have not yet slept.
// It's just me, my code & morgan.
CDiscoveryQueue.prototype.checkCardsLeft = function(){
  let self = this;
  if(!this.steamcookies){
    return Promise.reject('Not logged in.');
  }

  return new Promise((resolve, reject) => {
    request({
      uri: 'https://store.steampowered.com/explore/',
      method: "GET",
      headers: {
        cookie: this.steamcookies
      }
    }, (err, res, body) => {
      if(err)
        return reject(err);

      if(body && body.match('Come back tomorrow to earn more cards by browsing your Discovery Queue!'))
        return resolve(false);
      //if(body && body.match('Click here to begin exploring your queue'))
        return resolve(true);
      //return reject('Unknown error.');
    });
  });
}

function sleep(ms){
  return new Promise(resolve => {
    setTimeout(resolve, ms, null);
  });
}

require('./login.js');
