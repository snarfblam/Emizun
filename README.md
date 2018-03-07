# Emizun

Make all your text-based imaginary shopping simple with Emizun!

![Emizun.js - Command-line shopping made ez!](/images/logo.png)

Emizun is a CLI application that provides a make-pretend store-front and make-pretend store management for make-pretend people to buy make-pretend products. Emizun runs on Node.js and requires a mySQL database.

Emizun consists of three user interface packages as well as a separate package for common code.

---

# Table of Contents
1. [emizun-customer](#emizun-customer)
2. [emizun-supervisor](#emizun-supervisor)
3. [emizun-manager](#emizun-manager)
4. [emizun-util](#emizun-util)
    1. [emizun-util.table](#emizun-utiltable)
    2. [emizun-util.prompt](#emizun-utilprompt)

---    
## emizun-customer
```
? Select a product
  1        | ShamWow              | $19.95
> 2        | Snuggie              | $19.80
  3        | Chia Pet             | $15.97
  4        | My Pillow            | $39.95
```
`emizun-customer` provides a command line interface that allows a user to select goods and quantities to "purchase" products, updating the database to reflect their transactions.

---

## emizun-supervisor
```
╔══════════╤══════════════════════╤════════════╤════════════╤════════════╗
║  Dept ID │ Dept Name            │   Overhead │      Gross │     Profit ║
╟──────────┼──────────────────────┼────────────┼────────────┼────────────╢
║        2 │ Clothing             │  $20000.00 │  $59020.94 │  $39020.94 ║
║        1 │ Health & Wellness    │  $10000.00 │   $1992.95 │  $-8007.05 ║
╚══════════╧══════════════════════╧════════════╧════════════╧════════════╝
```
`emizun-supervisor` provides an interactive inventory reporting session. The user may request a report on profits by department and may register departments to be included in the report.

---
## emizun-manager
```
╔════════════╤══════════════════════╤══════════════╗
║    Stock # │ Product name         │ Qty in stock ║
╟────────────┼──────────────────────┼──────────────╢
║          1 │ ShamWow              │           13 ║
║          2 │ Snuggie              │           45 ║
```
`emizunManager.js` provides an interactive inventory management session. The user may request a report on current inventory (optionally filtered for products with low inventory), adjust inventory levels, and add new items to the product catalog.

---
## emizun-util
`emizun-util` defines functionality common to all three above packages and is the sole (explicit) dependency of each. `emizun-util` consists of the following files:
```
▼ Emizun-Util/
├───emizunUtil.js         Primary module. Exports: {table, prompt, 
│                           EmmizunConnection}
├───emizunDB.json         Database connection parameters (for 
│                           mysql.createConnection)
├───EmizunConnection.js   Wraps mysql to provide a simpler interface 
│                           specific to Emizun
├───table.js              Provides table rendering
├───prompt.js             Provides a streamlined wrapper around inquirer
└───schema.sql            Database schema
```

### emizun-util.table
The table object provides the following useful members:
 * `displayTable(rows, columnWidths, tableStyle?, dataTransform?, outputFunction?)`

    Renders a nested array as a table (rows containing columns). Alternatively accepts an array of objects (rows) and a function that converts each row object into a series of column values. By default output is routed to `console.log`, but a callback may be specified to recieve output.
 * `tableSeparator`

    Placeholder object that can be placed in the top-level array given to `displayTable()` which will render as a horizontal separator in the table.
 * `tableStyles` 

    Provides different styles tables may be rendered in: `dashes`, `inverse`, `inverseBorder`, `boxDrawing`, and `fattyBox`.
 * `tableize(columns, columnWidths)`
 
    Formats a single row into columns using the same column definitions as `displayTable()`.

### emizun-util.prompt
The prompt object wraps inquirer and provides the following useful members.
 * `makeChoices().add(value, displayString, selectedDisplayString?)`

    Returns an object which may be passed to inquirer as a choice list. Multiple calls to `.add` may be chained.
 * `options`
 
    A list of utility options that can be use to modify prompts.
 * `input()`
 
    Defines an input prompt.
 * `list()` 

    Defines a list prompt.
 * `confirm()` 

    Defines a confirm prompt.

`input()`, `list()`, and `confirm()` return a `Prompt` object, and these functions can be chained. 

The Prompt object further provides the following methods:
 * `show()` 
 
    Finalizes the prompt list and presents the sequence of prompts to the user. Returns the inquirer promise object.
 * `then()` 

    Convenience method. `Prompt.then()` is equivalent to `Prompt.show().then()`.

Sample usage:
```javascript
var languages = emizunUtil.prompt.makeChoices()
    .add('en', 'English')
    .add('es', 'Spanish')
    .add('fr', 'French');
    
emizunUtil.prompt
    .input('name', 'Enter your name.')
    .input('age', 'Enter your age.', emizunUtil.prompt.options.validateInt)
    .list('language', 'Select a language.', languages)
    .confirm('agree', 'Do you agree to the terms of use?')
    .then(data => {
        // data = (e.g.) { name: 'steve', age: '30', language: 'en', agree: true}
    });
```