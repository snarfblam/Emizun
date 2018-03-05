require('./polyfill');
var EmizunConnection = require('./EmizunConnection');
var table = require('./table');
var prompt = require('./prompt');

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
                return self._executeMode(mode)
                    .then(function () {
                        return prompt
                            .confirm("continue", "Perform another managerial action?")
                            .then(function (result) {
                                if (result.continue) return self.presentUI();
                            });
                    });
            });
    }

    /** Prompts user for mode. Returns a promise that resolves to an EmizunManager.modes value. */
    EmizunManager.prototype._promptForMode = function () {
        var modes = EmizunManager.modes;

        var choices = prompt.makeChoices()
            .add(modes.viewProducts, "View products")
            .add(modes.viewLowInventory, "View low inventory")
            .add(modes.addToInventory, "Add to inventory")
            .add(modes.addNewProduct, "Add new product");

        return prompt.list('mode', "Please select an operation", choices)
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
            case modes.addNewProduct: {
                return this._addNewProduct();
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

    EmizunManager.prototype._addNewProduct = function () {
        var departments = ["Home & Kitchen", "Tools & Home Improvement", "Electronics", "Clothing", "Garden & Outdoor", "Health & Wellness"];

        return prompt
            .input("name", "Enter the product name:")
            .list("dept", "Select the product department:", departments)
            .input("price", "Enter the product price (in cents):")
            .input("qty", "Enter the starting quantity:")
            .then(result => {
                var intQty = parseInt(result.qty);
                var intPrice = parseInt(result.price);
                var floatPrice = parseFloat(result.price);
                var error = null;

                if (isNaN(intQty) || intQty < 0) error = appendError(error, "Invalid quantity: should be a valid number >= 0.");
                if (isNaN(intPrice) || intPrice <= 0 || intPrice != floatPrice) error = appendError(error, "Invalid price: price must be a valid positive integer.");
                if (!result.name) error = appendError(error, "Name missing.");

                if (error) {
                    console.log("Could not process your request due to an error:\n" + error);
                    return prompt.confirm("retry", "Try again?", false)
                        .then(confirm => {
                            if (confirm.retry) return this._addNewProduct();
                        });
                } else {
                    console.log("Your request is being processed.");
                    var queryString = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)";
                    var queryValues = [result.name, result.dept, intPrice, intQty];
                    return connection
                        .query(queryString, queryValues)
                        .then(function (result) {
                            console.log("Your transaction is complete! The new product's stock number is " + result.insertId);
                    });

                }
            });

        function appendError(err, msg) {
            if (err) return err + "\n    " + msg;
            return "    " + msg;
        }
    }

    EmizunManager.prototype._displayProducts = function (maxQuantity) {
        return this._queryForProducts(maxQuantity).then(function (result) {
            var tableLayout = [-10, 20, -12];

            result.unshift(table.tableSeparator);
            result.unshift({ item_id: "Stock #", product_name: "Product name", stock_quantity: "Qty in stock" });

            var transform = item => [item.item_id, item.product_name, item.stock_quantity];
            table.displayTable(result, tableLayout, table.tableStyles.fattyBox, transform);
            console.log(result.length - 2 + " item(s)"); // -2 for header and separator
        })
    }

    /** Returns a promise that resolves to an inventory product entry */
    EmizunManager.prototype._promptForProduct = function () {
        var tableLayout = [-10, 20, -12];
        return this._queryForProducts().then(function (result) {
            var choices = prompt.makeChoices();
            result.forEach(function (item) {
                var display = table.tableize([item.item_id, item.product_name, item.stock_quantity], tableLayout, " | ");
                choices.add(item, display, item.product_name);
            });

            return prompt.list("item", "Select an item", choices)
                .then(function (result) {
                    return result.item;
                });
        });
    }

    EmizunManager.prototype._promptForQuantity = function (itemName) {
        return prompt.input("qty", "Enter quantity for '" + itemName + "':")
            .then(result => {
                var intResult = parseInt(result.qty);
                if (isNaN(intResult)) {
                    console.log("That is not a valid number.");
                    return this._promptForQuantity(itemName);
                } else if (intResult >= 0) {
                    return intResult;
                } else {
                    return prompt.confirm("confirm", "Are you sure you want to remove from inventory?", true)
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
