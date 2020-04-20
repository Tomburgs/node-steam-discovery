const Steam = require('./index.js');

const STEAM_INVENTORY_ID = 753;
const CARD_TYPE_ID = 6;

// This will pick-out every Steam sale item,
// this also includes emoticons & profile backgrounds.
Steam.prototype.getItems = function() {
    return new Promise((resolve, reject) => {
        this.manager.getUserInventoryContents(this.id64, STEAM_INVENTORY_ID, CARD_TYPE_ID, true, (err, inv) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(inv.filter(i => /The Steam .* Sale/i.test(i.type)));
            }
        });
    });
}

Steam.prototype._confirm = function(id) {
    this.community.acceptConfirmationForObject(this.confirmation, id, err => {
		if (err) {
            this.log(err);

			return setTimeout(
                () => this._confirm(id),
                2e2
            );
		}
	});
}

Steam.prototype.withdraw = function() {
    const offer = this.manager.createOffer(this.admin);

    this.getItems()
        .then(items => {
            if (items.length) {
                offer.addMyItems(items);
                offer.send((err) => {
                    if(err){
                        this.log(`Failed to send the tradeoffer. ${err}`);
                    } else {
                        this.log('Confirming offer...');

                        return this._confirm(offer.id);
                    }
                });
            } else {
                this.log('No items to send.');
            }
        })
        .catch(e => {
            console.error(e);
        });
}
