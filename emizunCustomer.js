require('./polyfill');
var EmizunConnection = require('./EmizunConnection');
var table = require('./table');
var prompt = require('./prompt');


/** Creates an EmizunCustomer object which queries the database and presents command-line prompts. */
function EmizunCustomer(emizunConnection) {
    /** @type {EmizunConnection} */
    this.connection = emizunConnection;
} { // static

    EmizunCustomer.formatProduct = function (dbEntry) {
        return table.tableize([dbEntry.item_id, dbEntry.product_name, table.formatCurrency(dbEntry.price)], [8, 20, 10], ' | ');
    }

    EmizunCustomer.formatProductShort = function (dbEntry) {
        return dbEntry.product_name + " " + "(" + table.formatCurrency(dbEntry.price) + ")";
    }

} { // methods

    /** Provides a series of customer prompts to the user and performs database queries on his behalf. */
    EmizunCustomer.prototype.presentUI = function () {
        var self = this;
        var selectedItem;

        return self._promptForProduct()
            .then(function (item) {
                selectedItem = item;
                return self._promptForQuantity(item.product_name, item.stock_quantity);
            }).then(function (qty) {
                if (qty == 0) {
                    console.log(selectedItem.product_name + " has been removed from your cart.");
                } else {
                    var totalPrice = selectedItem.price * qty;
                    var totalSales = selectedItem.product_sales + totalPrice;
                    console.log("Your total comes to " + table.formatCurrency(totalPrice) + ". Please wait while we process your transaction...");
                    return self._updateRow(selectedItem.item_id, selectedItem.stock_quantity - qty, totalSales)
                        .then(function () {
                            console.log("Your order has been placed!");
                        });
                }

            }).then(function () {
                return self._promptForAnotherTransaction();
            });
    };

    /** Retrieves the catalog and prompts the user to select a product. Returns a promise that resolves to the selected product database result. */
    EmizunCustomer.prototype._promptForProduct = function () {
        var self = this;

        return this._queryProducts()
            .then(function (result) {
                var productList = self._createProductList(result);
                return prompt.list('item', 'Select a product', productList).show();
            }).then(function (result) {
                return result.item;
            })
    }

    /** Prompts the user to enter a number of items. Returns a promise that resolves to a number. */
    EmizunCustomer.prototype._promptForQuantity = function (itemName, maxQty) {
        var self = this;


        return prompt.input('qty', 'Please enter a quantity for ' + itemName + ' (0 - ' + maxQty + '):')
            .show()
            .then(function (result) {
                var qty = parseInt(result.qty);

                if (isNaN(qty) || qty < 0 || qty > maxQty) {
                    // TRY AGAIN, JERK!
                    console.log("A valid number between 0 and " + maxQty + " is required.");
                    return self._promptForQuantity(itemName, maxQty);
                } else {
                    return qty;
                }
            });
    }

    /** Prompts the user to do another transaction. Returns a promise that resolves when the user is done. */
    EmizunCustomer.prototype._promptForAnotherTransaction = function () {
        var self = this;

        return prompt.confirm('again', 'Would you like another transaction?', true)
            .show()
            .then(function (result) {
                if (result.again) return self.presentUI();
            });
    }

    /** Retrieves a product list. Returns a promise. */
    EmizunCustomer.prototype._queryProducts = function () {
        return this.connection.query("SELECT * FROM products");
    }

    EmizunCustomer.prototype._createProductList = function (dbEntries) {
        var results = prompt.makeChoices();
        dbEntries.forEach(entry =>
            results.add(entry, EmizunCustomer.formatProduct(entry), EmizunCustomer.formatProductShort(entry))
        );

        return results;
    }

    /** Updates quantity for product in product table. Returns a promise.*/
    EmizunCustomer.prototype._updateRow = function (id, qty, totalSales) {
        return connection.query("UPDATE products SET ? WHERE ?", [
            {
                stock_quantity: qty,
                product_sales: totalSales,
            }, {
                item_id: id,
            }
        ]);
    }
}


var connection = new EmizunConnection();
var customer = new EmizunCustomer(connection);

connection.connect()
    .then(function () {
        return customer.presentUI();
    }).then(function () {
        console.log("Thanks for shopping.")
    }).catch(function (err) {
        console.log(err);
        console.log("There's been an error. So sorry mate!");
    }).then(function () {
        connection.disconnect();
    });
