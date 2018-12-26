const Steam = require('./index.js');

// This will pick-out every Steam sale item,
// this also includes emoticons & profile backgrounds which is great!
Steam.prototype.getItems = function(){
  return new Promise((resolve, reject) => {
    this.manager.getUserInventoryContents(this.id64, 753, 6, true, (err, inv) => {
      if(err){
        return reject(err);
      } else {
        return resolve(inv.filter(i => i.type.match(/The Steam .* Sale/i)));
      }
    });
  });
}

Steam.prototype._confirm = function(id){
  this.community.acceptConfirmationForObject(this.confirmation, id, err => {
		if(err){
      this.log(err);
			return setTimeout(() => {
				this._confirm(id);
			}, 2e2);
		}
	});
}

Steam.prototype.withdraw = function(){
  let self = this, offer = self.manager.createOffer(this.admin);

  this.getItems()
  .then(items => {
    if(items.length > 0){
      offer.addMyItems(items);
      offer.send((err, status) => {
        if(err){
          self.log(`Failed to send the tradeoffer. ${err}`);
        } else {
          self.log('Confirming offer...');
          return self._confirm(offer.id);
        }
      });
    } else {
      self.log('No items to send.');
    }
  })
  .catch(e => {
    console.error(e);
  });
}
