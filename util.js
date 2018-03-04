var inquirer = require('inquirer');

/** Formats a string to use columns of the specified widths. */
function tableize(values, widths, columnSeparator,) {
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

function tableSeparator(columnWidths, columnSeparator, separatorChar) {
    var result = "";
    for (var i = 0; i < columnWidths.length; i++) {
        if (i > 0) result += columnSeparator;
        result += (separatorChar || '-').repeat(columnWidths[i]);
    }

    return result;
}

/** Formats a table of values.
 * @param {string[][] | any[]} data - An array of rows. Each row is an array of strings for each column or an object that will be converted to an array of strings (see outputFunction).
 * @param {number[]} columnLayout - An array of numbers specifying column widths. A default value will be used if the array is too small for the number of needed columns.
 * @param {Object} [tableStyle] - An object defining the appearance of the table. See tableStyles object.
 * @param {(item: any) => string[]} [dataTransform] - A function that converts each object in the data array into an array of column values
 * @param {(text: string) => void} [outputFunction] - A function that is called successively with each line of the rendered table. Defaults to console.log.
 */
function displayTable(data, columnLayout, tableStyle, dataTransform, outputFunction) {
    // Use default table style if not specified
    var finalStyle = tableStyle || tableStyles.dashes;

    // Log to console by default
    outputFunction = outputFunction || _console_log;

    // doet
    outputFunction(
        finalStyle.topLeft +
        tableSeparator(columnLayout, finalStyle.intersectionTop, finalStyle.separator) + 
        finalStyle.topRight);
    
    data.forEach(function (item) {
        if (dataTransform) item = dataTransform(item);
        outputFunction(
            finalStyle.left + 
            tableize(item, columnLayout, finalStyle.columnSeparator, outputFunction) +
            finalStyle.right);
    });

    outputFunction(
        finalStyle.bottomLeft +
        tableSeparator(columnLayout, finalStyle.intersectionBottom, finalStyle.separator) + 
        finalStyle.bottomRight);
}

function _console_log(string) {
    console.log(string);
}

var tableStyles = {
    dashes: {
        separator: '-',
        columnSeparator: ' | ',
        intersectionTop: '-+-',
        intersectionMiddle: '-+-',
        intersectionBottom: '-+-',
        topLeft: "",
        left: "",
        bottomLeft: "",
        topRight: "",
        right: "",
        bottomRight: "",
    },
    boxDrawing: {
        separator: '─',
        columnSeparator: ' │ ',
        intersectionTop: '─┬─',
        intersectionMiddle: '─┼─',
        intersectionBottom: '─┴─',
        topLeft: "┌─",
        left: "│ ",
        bottomLeft: "└─",
        topRight: "─┐",
        right: " │",
        bottomRight: "─┘",
    }
}

/** Formats a number of cents into a string such as $1.99 */
function formatCurrency(cents) {
    return "$" + (cents / 100).toFixed(2)
}

function Prompt() {
    this.prompts = [];
} { // Static

    /** Returns a choices builder object. Has an add(value, display, selectedDisplay) method and
     * can be provided directly to the 'list' or 'rawList' prompt as the choice list. */
    Prompt.makeChoices = function (value, display, selectedDisplay) {
        var result = [];

        result.add = function (value, display, selectedDisplay) {
            this.push({
                value: value,
                name: display,
                short: (selectedDisplay == undefined) ? display : selectedDisplay,
            });

            return this;
        };

        if (value != undefined) {
            result.add(value, display, selectedDisplay);
        }

        return result;
    }

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
module.exports.tableSeparator = tableSeparator;
module.exports.formatCurrency = formatCurrency;
module.exports.displayTable = displayTable;
module.exports.tableStyles = tableStyles;
// module.exports.prompt = function () { return new Prompt(); }
module.exports.prompt = {
    input: function (name, message) { return new Prompt().input(name, message); },
    list: function (name, message, choices) { return new Prompt().list(name, message, choices); },
    confirm: function (name, message, dfault) { return new Prompt().confirm(name, message, dfault); },
    makeChoices: function (value, display, selectedDisplay) { return Prompt.makeChoices(value, display, selectedDisplay); },
}