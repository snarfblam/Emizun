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
        
        return util.prompt.list('mode', "Please select an operation", choices)
            .show()
            .then(function (result) {
                return result.mode; 
            });
    }

    EmizunManager.prototype._executeMode = function (mode) {
        var modes = EmizunManager.modes;
        
        switch (mode) {
            case modes.viewProducts:
                return this._displayProducts();    
            case modes.viewLowInventory:    
                return this._displayProducts(4);    
            default:
                return Promise.reject(new Error("Unknown manager mode"));
        }
    }

    EmizunManager.prototype._displayProducts = function (maxQuantity) {
        var queryString = "SELECT * FROM PRODUCTS"
        if (maxQuantity) queryString += " WHERE stock_quantity <= " + maxQuantity;

        return this.connection.query(queryString).then(function (result) {
            var tableLayout = [-10, 20, -12];

            result.unshift(util.tableSeparator);
            result.unshift({item_id: "ID", product_name: "Product name", stock_quantity: "Qty in stock"});

            var transform = item => [item.item_id, item.product_name, item.stock_quantity];
            util.displayTable(result, tableLayout, util.tableStyles.fattyBox, transform);
            console.log(result.length - 2 + " item(s)"); // -2 for header and separator
        })
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
