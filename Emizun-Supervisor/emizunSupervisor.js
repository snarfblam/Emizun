require('./polyfill');
var EmizunConnection = require('./EmizunConnection');
var table = require('./table');
var prompt = require('./prompt');


function EmizunSupervisor(connection) {
    /** @type {EmizunConnection} */
    this.connection = connection;
} { // Static

    EmizunSupervisor.modes = {
        viewDepartments: "View product sales by department",
        addDepartment: "Register new department",
    };
    EmizunSupervisor.modeChoices = [
        EmizunSupervisor.modes.viewDepartments,
        EmizunSupervisor.modes.addDepartment];

} { // Methods 

    EmizunSupervisor.prototype.presentUI = function () {
        return this._promptForMode()
            .then(() => {
                return prompt.confirm("continue", "Would you like to perform additional tasks?")
                    .then(input => {
                        if (input.continue) return this.presentUI();
                    })
            });
    }

    EmizunSupervisor.prototype._promptForMode = function () {
        return prompt.list("mode", "Select an operation:", EmizunSupervisor.modeChoices)
            .then(input => {
                switch (input.mode) {
                    case EmizunSupervisor.modes.viewDepartments:
                        return this._logDepartmentsSummary();
                    case EmizunSupervisor.modes.addDepartment:
                        return this._createDepartment();
                }
            });
    }

    EmizunSupervisor.prototype._createDepartment = function () {
        return prompt
            .input("department_name", "Enter the name of the department you wish to register:", prompt.options.validateNotblank)
            .input("overhead_costs", "Enter the dept. estimated overhead (dollars):", prompt.options.validateInt)
            .then(dept => {
                dept.overhead_costs *= 100; // Convert dollars to cents

                query = "INSERT INTO departments (department_name, overhead_costs) VALUES (?, ?);";
                return this.connection.query(query, [dept.department_name, dept.overhead_costs]);
            })
            .then(() => { 
                console.log("The department has been registered and will display in your reports.");
            });
    }

    EmizunSupervisor.prototype._logDepartmentsSummary = function () {
        var tableLayout = [-8, 20, -10, -10, -10];

        return this._queryDepartmentsSummary()
            .then(summary => {
                // Table heading
                summary.unshift(table.tableSeparator);
                summary.unshift({
                    department_id: "Dept ID",
                    department_name: "Dept Name",
                    overhead_costs: "Overhead",
                    department_sales: "Gross",
                    total_profit: "Profit",
                });

                table.displayTable(
                    summary,
                    tableLayout,
                    table.tableStyles.fattyBox,
                    entry => [
                        entry.department_id,
                        entry.department_name,
                        formatCurrency(entry.overhead_costs),
                        formatCurrency(entry.department_sales),
                        formatCurrency(entry.total_profit)]
                );
            });

        function formatCurrency(c) {
            if (typeof c == 'number') return table.formatCurrency(c);
            return c;
        }
    }

    EmizunSupervisor.prototype._queryDepartmentsSummary = function () {
        var query =
            "SELECT " +
            "    department_id, " +
            "    departments.department_name, " +
            "    overhead_costs, " +
            "    SUM(product_sales) AS department_sales, " +
            "    (SUM(product_sales) - overhead_costs) AS total_profit " +
            "FROM " +
            "    products " +
            "        INNER JOIN " +
            "    departments USING (department_name) " +
            "GROUP BY department_name;        ";
        return this.connection.query(query);
    }

}


var connection = new EmizunConnection();
var supervisor = new EmizunSupervisor(connection);


connection.connect()
    .then(function () {
        return supervisor.presentUI();
    }).then(function () {
        console.log("Thanks for supervising.")
    }).catch(function (err) {
        console.log(err);
        console.log("There's been an error. Supersorry!");
    }).then(function () {
        connection.disconnect();
    });