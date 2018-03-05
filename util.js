var inquirer = require('inquirer');

/** Formats a string to use columns of the specified widths. */
function tableize(values, widths, columnSeparator, ) {
    var result = "";

    for (var i = 0; i < values.length; i++) {
        if (i > 0 && columnSeparator) result += columnSeparator;

        var value = values[i];
        if (value == undefined || value == null) value = "";
        value = value.toString();
        var width = widths[i] || 10;
        var rightAlign = width < 0;
        width = Math.abs(width);

        if (value.length > width) {
            value = value.substr(0, width - 3) + "...";
        } else if (value.length < width) {
            if (rightAlign) {
                value = value.padStart(width);
            } else {
                value = value.padEnd(width);
            }
        }

        result += value;
    }

    return result;
}

function createTableSeparator(columnWidths, columnSeparator, separatorChar) {
    var result = "";
    for (var i = 0; i < columnWidths.length; i++) {
        if (i > 0) result += columnSeparator;
        result += (separatorChar || '-').repeat(Math.abs(columnWidths[i]));
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
        createTableSeparator(columnLayout, finalStyle.intersectionTop, finalStyle.top) +
        finalStyle.topRight);

    data.forEach(function (item) {
        if (item == tableSeparator) {
            outputFunction(
                finalStyle.interesctionLeft +
                createTableSeparator(columnLayout, finalStyle.intersectionMiddle, finalStyle.separator) +
                finalStyle.intersectionRight);
        } else {
            if (dataTransform) item = dataTransform(item);
            outputFunction(
                finalStyle.left +
                tableize(item, columnLayout, finalStyle.columnSeparator, outputFunction) +
                finalStyle.right);
            }
    });

    outputFunction(
        finalStyle.bottomLeft +
        createTableSeparator(columnLayout, finalStyle.intersectionBottom, finalStyle.bottom) +
        finalStyle.bottomRight);
}

var tableSeparator = {};

function _console_log(string) {
    console.log(string);
}

var inverse = "\x1b[30m\x1b[47m";
var normal = "\x1b[37m\x1b[40m\x1b[0m";
var tableStyles = {
    dashes: {
        separator: '-',
        columnSeparator: ' | ',
        intersectionTop: '-+-',
        intersectionMiddle: '-+-',
        intersectionBottom: '-+-',
        interesctionLeft: "",
        intersectionRight: "",  
        topLeft: "",
        left: "",
        bottomLeft: "",
        topRight: "",
        right: "",
        bottomRight: "",
        top: "-",
        bottom: "-",
    },
    inverse: {
        separator: '─',
        columnSeparator: ' │ ',
        intersectionTop: '   ',
        intersectionMiddle: '─┼─',
        intersectionBottom: '   ',
        interesctionLeft: inverse + "─",
        intersectionRight: "─" + normal,  
        topLeft: "",
        left: inverse + " ",
        bottomLeft: "",
        topRight: "",
        right: " " + normal,
        bottomRight: "",
        top: " ",
        bottom: " ",
    },
    inverseBorder: {
        separator: '─',
        columnSeparator: ' │ ',
        intersectionTop: '═══',
        intersectionMiddle: '─┼─',
        intersectionBottom: '═══',
        interesctionLeft: "║" + inverse + "─",
        intersectionRight: "─" + normal + "║",  
        topLeft: "╔═",
        topRight: "═╗",
        bottomLeft: "╚═",
        bottomRight: "═╝",
        left: "║" + inverse + " ",
        right: " " + normal + "║",
        top: "═",
        bottom: "═",
    },
    boxDrawing: {
        separator: '─',
        columnSeparator: ' │ ',
        intersectionTop: '─┬─',
        intersectionMiddle: '─┼─',
        intersectionBottom: '─┴─',
        interesctionLeft: "├─",
        intersectionRight: "─┤",    
        topLeft: "┌─",
        left: "│ ",
        bottomLeft: "└─",
        topRight: "─┐",
        right: " │",
        bottomRight: "─┘",
        top: "─",
        bottom: "─",
    },
    fattyBox: { //╔═╤╗╟─┼╢╚═╧╝
        separator: '─',
        columnSeparator: ' │ ',
        intersectionTop: '═╤═',
        intersectionMiddle: '─┼─',
        intersectionBottom: '═╧═',
        interesctionLeft: "╟─",
        intersectionRight: "─╢",    
        topLeft: "╔═",
        topRight: "═╗",
        bottomLeft: "╚═",
        bottomRight: "═╝",
        left: "║ ",
        right: " ║",
        top: "═", 
        bottom: "═",
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

    Prompt.options = {
        validateNumber: {
            validate: function(value) {
                var numValue = parseFloat(value);
                if (isNaN(numValue)) return "Please enter a valid number."
                return true;
            }
        },
        validateInt: {
            validate: function (value) {
                var numValue = parseFloat(value);
                var intValue = parseInt(value);
                if (isNaN(intValue)) return "Please enter a valid integer."
                if (intValue != numValue) return "Please enter a valid integer.";
                return true;
            }
        },
        validateNotblank: {
            validate: function (value) {
                if (!value && value !== 0) return "This field can not be blank.";
                return true;
            }    
        }
    }

    /** Applies each property on 'options' to the 'prompt' object. If 'options' is an array
     * then this operation is performed on each item in the 'options' array      */
    Prompt._applyOptions = function (prompt, options) {
        if (options instanceof Array) {
            options.forEach(function (opt) {
                for (key in opt) {
                    prompt[key] = opt[key];
                } 
            });
        } else {
            for (key in options) {
                prompt[key] = options[key];
            }
        }    
    }

    //Prompt.numericValidator = 

} { // Methods

    Prompt.prototype.input = function (name, message, options) {
        var prompt = { type: 'input', name: name };
        if (message) prompt.message = message;
        Prompt._applyOptions(prompt, options);

        this.prompts.push(prompt);
        return this;
    };

    Prompt.prototype.list = function (name, message, choices, options) {
        var prompt = { type: 'list', name: name, choices: choices };
        if (message) prompt.message = message;
        Prompt._applyOptions(prompt, options);


        this.prompts.push(prompt);
        return this;
    };

    Prompt.prototype.confirm = function (name, message, dfault, options) {
        var prompt = { type: 'confirm', name: name };
        if (message) prompt.message = message;
        if (dfault != undefined) prompt.default = dfault;
        Prompt._applyOptions(prompt, options);


        this.prompts.push(prompt);
        return this;
    }

    Prompt.prototype.show = function () {
        return inquirer.prompt(this.prompts);
    }

    Prompt.prototype.then = function (onResolved, onRejected) {
        return this.show().then(onResolved, onRejected);
    }
}


module.exports.tableize = tableize;
module.exports.tableSeparator = tableSeparator;
module.exports.formatCurrency = formatCurrency;
module.exports.displayTable = displayTable;
module.exports.tableStyles = tableStyles;
module.exports.tableSeparator = tableSeparator;
// module.exports.prompt = function () { return new Prompt(); }
module.exports.prompt = {
    input: function (name, message, options) { return new Prompt().input(name, message, options); },
    list: function (name, message, choices, options) { return new Prompt().list(name, message, choices, options); },
    confirm: function (name, message, dfault, options) { return new Prompt().confirm(name, message, dfault, options); },
    /** Returns an object with method .add(value, display, [selectionDisplay]) that can be chained to construct a choices list. */
    makeChoices: function (value, display, selectedDisplay) { return Prompt.makeChoices(value, display, selectedDisplay); },
    options: Prompt.options,
}