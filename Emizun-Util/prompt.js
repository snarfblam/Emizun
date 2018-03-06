var inquirer = require('inquirer');


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

module.exports = {
    input: function (name, message, options) { return new Prompt().input(name, message, options); },
    list: function (name, message, choices, options) { return new Prompt().list(name, message, choices, options); },
    confirm: function (name, message, dfault, options) { return new Prompt().confirm(name, message, dfault, options); },
    /** Returns an object with method .add(value, display, [selectionDisplay]) that can be chained to construct a choices list. */
    makeChoices: function (value, display, selectedDisplay) { return Prompt.makeChoices(value, display, selectedDisplay); },
    options: Prompt.options,
}