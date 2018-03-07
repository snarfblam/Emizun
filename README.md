# Emizun

Make all your text-based imaginary shopping simple with Emizun!

![Emizun.js - Command-line shopping made ez!](/images/logo.png)

Emizun is a CLI application that provides a make-pretend store-front and make-pretend store management for make-pretend people to buy make-pretend products. Emizun runs on Node.js and requires a mySQL database.

Emizun consists of the user interface packages as well as a separate package for common code.

---

# Table of Contents
1. [emizun-customer](#emizun-customer)
2. [emizun-supervisor](#emizun-supervisor)
3. [emizun-manager](#emizun-manager)
4. [emizun-util](#emizun-util)
    1. [emizun-util.table](#emizun-util.table)
    2. [emizun-util.prompt](#emizun-util.prompt)

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
├───emizunUtil.js         Primary module, exports {table, prompt, 
│                           EmmizunConnection}
├───emizunDB.json         Database connection parameters (for 
│                           mysql.createConnection)
├───EmizunConnection.js   Wraps mysql to provide a simpler interface 
│                           specific to Emizun
├───table.js              Provides table rendering
├───prompt.js             Provides a streamlines wrapper around inquirer
└───schema.sql            Database schema
```

### emizun-util.table
The table object provides the following useful members:
 * `displayTable()` - Renders a nested array as a table. Alternatively accepts an array of objects and a function that converts each function into a series of column values. By default output is routed to `console.log`, but callback may be specified to recieve output.
 * `tableSeparator` - Placeholder object that can be placed in the top-level array given to `displayTable()` which will render as a horizontal separator in the table.
 * `tableStyles` - Provides differeent styles tables may be rendered in.
 * `tableize` - Formats a single row into columns using the same column definitions as `displayTable()`.

### emizun-util.prompt
The prompt object provides the following useful members.
 * `makeChoices()` - Returns an object with a `.add` method to construct an array of choices for a list prompt. Calls to `.add` may be chained, and the choices object can be passed directly to inquirer as a choices list.
 * `options` - A list of utility options that can be use to modify prompts.
 * `input()` - Defines an input prompt.
 * `list()` - Defines a list prompt.
 * `confirm()` - Defines a confirm prompt.

`input()`, `list()`, and `confirm()` return a prompt, and these functions can be chained. 

The prompt object further provides the following methods:
 * `show()` - Finalizes the prompt list and presents the sequence of prompts to the user. Returns the inquirer promise object.
 * `then()` - Convenience method. `Prompt.then()` is equivalent to `Prompt.show().then()`.

Sample usage:
```javascript
var languages = emizunUtil.prompt.makeChoices()
    .add('en', 'English')
    .add('es', 'Spanish')
    .add('fr', 'French');
    
emizunUtil.prompt
    .input('name', 'Enter your name.')
    .input('age', 'Enter your age.', emizunUtil.prompt.validateInt)
    .list('language', 'Select a language.', languages)
    .then(data => {
        //process data
    });
```