require('./polyfill');
var EmizunConnection = require('./EmizunConnection');
var util = require('./util');


function EmizunManager(connection) {
    /** @type {EmizunConnection} */
    this.connection = connection;
} { // static

    EmizunManager.modes = {
        viewProducts: "viewProducts",
        viewLowInventory: "viewLowInventory",
        addToInventory: "addToInventory",
        addNewProduct: "addNewProduct",
    };

} { // methods 

    EmizunManager.prototype.presentUI = function () {
        var self = this;

        return self._promptForMode()
            .then(function (mode) {
                return self._executeMode(mode);
            })
    }

    /** Prompts user for mode. Returns a promise that resolves to an EmizunManager.modes value. */
    EmizunManager.prototype._promptForMode = function () {
        var modes = EmizunManager.modes;

        var choices = util.prompt.makeChoices()
            .add(modes.viewProducts, "View products")
            .add(modes.viewLowInventory, "View low inventory")
            .add(modes.addToInventory, "Add to inventory")
            .add(modes.addNewProduct, "Add new product");

        return util.prompt
            .list('mode', "Please select an operation", choices)
            .then(function (result) {
                return result.mode;
            });
    }

    EmizunManager.prototype._executeMode = function (mode) {
        var modes = EmizunManager.modes;
        var product;

        switch (mode) {
            case modes.viewProducts:
                return this._displayProducts();
            case modes.viewLowInventory:
                return this._displayProducts(4);
            case modes.addToInventory: {
                return this._promptForProduct()
                    .then(p => {
                        product = p;
                        return this._promptForQuantity(product.product_name);
                    })
                    .then(qty => {
                        var newQty = product.stock_quantity + qty;
                        var negative = newQty < 0;
                        newQty = Math.max(0, newQty);

                        console.log(negative ? "Warning: minimum quantity is 0." : "Your request is being processed.");

                        return this._updateQty(product.item_id, newQty)
                            .then(() => { 
                                console.log("Transaction complete.");
                            });
                    });
            }
            default:
                return Promise.reject(new Error("Unknown manager mode"));
        }
    }

    /** Updates quantity for product in product table. Returns a promise.*/
    EmizunManager.prototype._updateQty = function (id, qty) {
        return connection.query("UPDATE products SET ? WHERE ?", [
            {
                stock_quantity: qty,
            }, {
                item_id: id,
            }
        ]);
    }

    EmizunManager.prototype._displayProducts = function (maxQuantity) {
        this._queryForProducts(maxQuantity).then(function (result) {
            var tableLayout = [-10, 20, -12];

            result.unshift(util.tableSeparator);
            result.unshift({ item_id: "ID", product_name: "Product name", stock_quantity: "Qty in stock" });

            var transform = item => [item.item_id, item.product_name, item.stock_quantity];
            util.displayTable(result, tableLayout, util.tableStyles.fattyBox, transform);
            console.log(result.length - 2 + " item(s)"); // -2 for header and separator
        })
    }

    /** Returns a promise that resolves to an inventory product entry */
    EmizunManager.prototype._promptForProduct = function () {
        var tableLayout = [-10, 20, -12];
        return this._queryForProducts().then(function (result) {
            var choices = util.prompt.makeChoices();
            result.forEach(function (item) {
                var display = util.tableize([item.item_id, item.product_name, item.stock_quantity], tableLayout, " | ");
                choices.add(item, display, item.product_name);
            });

            return util.prompt
                .list("item", "Select an item", choices)
                .then(function (result) {
                    return result.item;
                });
        });
    }

    EmizunManager.prototype._promptForQuantity = function (itemName) {
        return util.prompt
            .input("qty", "Enter quantity for '" + itemName + "':")
            .then(result => {
                var intResult = parseInt(result.qty);
                if (isNaN(intResult)) {
                    console.log("That is not a valid number.");
                    return this._promptForQuantity(itemName);
                } else if (intResult >= 0) {
                    return intResult;
                } else {
                    return util.prompt
                        .confirm("confirm", "Are you sure you want to remove from inventory?", true)
                        .then(confirmResult => {
                            if (confirmResult.confirm) {
                                return intResult;
                            } else {
                                return this._promptForQuantity(itemName);
                            }
                        });
                }
            });
    }

    /** Returns a promise that resolves to an array of inventory items */
    EmizunManager.prototype._queryForProducts = function (maxQuantity) {
        var queryString = "SELECT * FROM PRODUCTS"
        if (maxQuantity) queryString += " WHERE stock_quantity <= " + maxQuantity;

        return this.connection.query(queryString);
    }
}


var connection = new EmizunConnection();
var manager = new EmizunManager(connection);

connection.connect()
    .then(function () {
        return manager.presentUI();
    }).then(function () {
        console.log("Thanks for managing.")
    }).catch(function (err) {
        console.log(err);
        console.log("There's been an error. So sorry boss!");
    }).then(function () {
        connection.disconnect();

    });
