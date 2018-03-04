var inquirer = require('inquirer');

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

function Prompt() {
    this.prompts = [];
} { // Methods

    Prompt.prototype.input = function (name, message) {
        var prompt = { type: 'input', name: name };
        if (message) prompt.message = message;

        this.prompts.push(prompt);
        return this;
    };

    Prompt.prototype.list = function (name, message, choices) {
        var prompt = { type: 'list', name: name, choices: choices };
        if (message) prompt.message = message;


        this.prompts.push(prompt);
        return this;
    };

    Prompt.prototype.confirm = function (name, message, dfault) {
        var prompt = { type: 'confirm', name: name };
        if (message) prompt.message = message;
        if (dfault != undefined) prompt.default = dfault;


        this.prompts.push(prompt);
        return this;
    }

    Prompt.prototype.show = function () {
        return inquirer.prompt(this.prompts);
    }
}


module.exports.tableize = tableize;
module.exports.formatCurrency = formatCurrency;
// module.exports.prompt = function () { return new Prompt(); }
module.exports.prompt = {
    input: function (name, message) { return new Prompt().input(name, message); },
    list: function (name, message, choices) { return new Prompt().list(name, message, choices); },
    confirm: function (name, message, dfault) { return new Prompt().confirm(name, message, dfault); },
}