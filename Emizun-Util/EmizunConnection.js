var mysql = require('mysql');
var databaseConfig = require('./emizunDB')

function EmizunConnection() {
    this.connection = mysql.createConnection(databaseConfig);

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

module.exports = EmizunConnection;