require('./polyfill');
var inquirer = require('inquirer');
var EmizunConnection = require('./EmizunConnection');

/** Formats a string to use columns of the specified widths. */
function tableize(values, widths, columnSeparator) {
    var result = "";

    for (var i = 0; i < values.length; i++) {
        if (i > 0 && columnSeparator) result += columnSeparator;

        var value = (values[i] || "null").toString();
        var width = widths[i] || 10;

        if (value.length > width) {
            value = value.substr(0, width - 3) + "...";
        } else if (value.length < width) {
            value = value.padEnd(width);
        }

        result += value;
    }

    return result;
}

/** Formats a number of cents into a string such as $1.99 */
function formatCurrency(cents) {
    return "$" + (cents / 100).toFixed(2)
}

/** Creates an EmizunCustomer object which queries the database and presents command-line prompts. */
function EmizunCustomer(emizunConnection) {
    /** @type {EmizunConnection} */
    this.connection = emizunConnection;
} { // static

    EmizunCustomer.formatProduct = function (dbEntry) {
        return tableize([dbEntry.item_id, dbEntry.product_name, formatCurrency(dbEntry.price)], [8, 20, 10], ' | ');
    }

    EmizunCustomer.formatProductShort = function (dbEntry) {
        return dbEntry.product_name + " " + "(" + formatCurrency(dbEntry.price) + ")";
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
                    console.log("Your total comes to " + formatCurrency(selectedItem.price * qty) + ". Please wait while we process your transaction...");
                    return self._updateRow(selectedItem.item_id, selectedItem.stock_quantity - qty)
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
                return inquirer.prompt([{
                    type: 'list',
                    message: 'Select a product.',
                    choices: productList,
                    name: 'item',
                }]);
            }).then(function (result) {
                return result.item;
            })
    }

    /** Prompts the user to enter a number of items. Returns a promise that resolves to a number. */
    EmizunCustomer.prototype._promptForQuantity = function (itemName, maxQty) {
        var self = this;

        return inquirer.prompt([{
            type: 'input',
            message: 'Please enter a quantity for ' + itemName + ' (0 - ' + maxQty + '):',
            name: 'qty'
        }]).then(function (result) {
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

        return inquirer.prompt([{
            type: 'confirm',
            message: 'Would you like another transaction?',
            name: 'again',
        }]).then(function (result) {
            if (result.again) {
                return self.presentUI();
            }
        });
    }

    /** Retrieves a product list. Returns a promise. */
    EmizunCustomer.prototype._queryProducts = function () {
        return this.connection.query("SELECT * FROM products");
    }

    EmizunCustomer.prototype._createProductList = function (dbEntries) {
        var self = this;

        var results = [];
        dbEntries.forEach(e => {
            results.push({
                name: EmizunCustomer.formatProduct(e),
                value: e,
                short: EmizunCustomer.formatProductShort(e),
            });
        });

        return results;
    }

    /** Updates quantity for product in product table. Returns a promise.*/
    EmizunCustomer.prototype._updateRow = function (id, qty) {
        return connection.query("UPDATE products SET ? WHERE ?", [
            {
                stock_quantity: qty,
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
    }).catch(function (err) {
        console.log(err);
    }).then(function () {
        console.log("Thanks for shopping.")
        connection.disconnect();
    });
