require('./polyfill');
var inquirer = require('inquirer');
var mysql = require('mysql');



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

function formatCurrency(cents) {
    return "$" + (cents / 100).toFixed(2)
}

function EmizunConnection() {
    this.connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'sequelitis',
        database: 'emizun',
    });

    this.connected = false;
} { // methods

    /** Connects to the database. Returns a promise. */
    EmizunConnection.prototype.connect = function () {
        var self = this;

        return new Promise(function (resolve, reject) {
            if (self.connected) resolve(self);

            self.connection.connect(function (err) {
                if (err) reject(err);

                self.connected = true;
                resolve(self);
            });
        });
    };

    EmizunConnection.prototype.disconnect = function () {
        if (this.connected) {
            this.connection.end();
            this.connected = false;
        }
    };

    /** Performs the specified query. Returns a promise. */
    EmizunConnection.prototype.query = function (queryString, values) {
        var self = this;

        return new Promise(function (resolve, reject) {
            if (values) {
                self.connection.query(queryString, values, function (err, result) {
                    if (err) reject(err);
                    resolve(result);
                });
            } else {
                self.connection.query(queryString, function (err, result) {
                    if (err) reject(err);
                    resolve(result);
                });
            }
        })
    };

}

function EmizunCustomer(emizunConnection) {
    /** @type {EmizunConnection} */
    this.connection = emizunConnection;
} { // methods

    EmizunCustomer.prototype.presentUI = function () {
    }

    /** Retrieves the catalog and prompts the user to select a product. Returns a promise that resolves to the selected product database result. */
    EmizunCustomer.prototype.promptForProduct = function () {
        var self = this;

        return this.queryProducts()
            .then(function (result) {
                var productList = self.createProductList(result);
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
    EmizunCustomer.prototype.promptForQuantity = function (itemName, maxQty) {
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
                return self.promptForQuantity(itemName, maxQty);
            } else {
                return qty;
            }
        });
    }

    /** Retrieves a product list. Returns a promise. */
    EmizunCustomer.prototype.queryProducts = function () {
        return this.connection.query("SELECT * FROM products");
    }

    EmizunCustomer.prototype.createProductList = function (dbEntries) {
        var self = this;

        var results = [];
        dbEntries.forEach(e => {
            results.push({
                name: self.formatProduct(e),
                value: e,
                short: self.formatProductShort(e),
            });
        });

        return results;
    }

    EmizunCustomer.prototype.formatProduct = function (dbEntry) {
        return tableize([dbEntry.item_id, dbEntry.product_name, formatCurrency(dbEntry.price)], [8, 20, 10], ' | ');
    }

    EmizunCustomer.prototype.formatProductShort = function (dbEntry) {
        return dbEntry.product_name + " " + "(" + formatCurrency(dbEntry.price) + ")";
    }

    /** Updates quantity for product in product table. Returns a promise.*/
    EmizunCustomer.prototype.updateRow = function (id, qty) {
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

var selectedItem;

connection.connect()
    .then(function () {
        return connection.query("SELECT * FROM products");
    }).then(function (result) {
        return customer.promptForProduct();
    }).then(function (item) {
        // console.log("SELECTION: ", id);
        selectedItem = item;

        return customer.promptForQuantity(item.product_name, item.stock_quantity);
    }).then(function (qty) {
        if (qty == 0) {
            console.log(selectedItem.product_name + " has been removed from your cart.");
        } else {
            console.log("Your total comes to " + formatCurrency(selectedItem.price * qty) + ". Please wait while we process your transaction...");
            return customer.updateRow(selectedItem.item_id, selectedItem.stock_quantity - qty)
                .then(function () { 
                    console.log("Your order has been placed!");
                });
        }
    }).catch(function (err) {
        console.log(err);
    }).then(function () {
        connection.disconnect();
    });
