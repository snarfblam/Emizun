# Emizun

Make all your text-based imaginary shopping simple with Emizun!

![Emizun.js - Command-line shopping made ez!](/images/logo.png)

Emizun is a CLI application that provides a make-pretend store-front and make-pretend store management for make-pretend people to buy make-pretend products. Emizun runs on Node.js and requires a mySQL database.

[Watch the exciting demo](videos/demo.mp4)

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
`emizun-customer` provides a command line interface that allows a user to select goods and quantities to "purchase" products, updating the database to reflect their transactions. Launch the app and then select a product from the list.
```
? Select a product
  1        | ShamWow              | $19.95
> 2        | Snuggie              | $19.80
  3        | Chia Pet             | $15.97
  4        | My Pillow            | $39.95
```
Then enter a quantity to purchase. (Enter a quantity of 0 to cancel the purchase.)
```
? Please enter a quantity for Snuggie (0 - 45): 2
Your total comes to $39.60. Please wait while we process your transaction...
Your order has been placed!
```

---

## emizun-supervisor
`emizun-supervisor` provides an interactive sales reporting session. The user may select two operations. **View product sales by department** will present a sales report, like so:
```
╔══════════╤══════════════════════╤════════════╤════════════╤════════════╗
║  Dept ID │ Dept Name            │   Overhead │      Gross │     Profit ║
╟──────────┼──────────────────────┼────────────┼────────────┼────────────╢
║        2 │ Clothing             │  $20000.00 │  $59020.94 │  $39020.94 ║
║        1 │ Health & Wellness    │  $10000.00 │   $1992.95 │  $-8007.05 ║
╚══════════╧══════════════════════╧════════════╧════════════╧════════════╝
```
**Register new department** will prompt you to enter a department name to be tracked. This should match the department names entered for individual inventory items *exactly*. You will also be prompted to enter the department's estimated overhead cost.

---
## emizun-manager
`emizunManager.js` provides an interactive inventory management session. **View products** presents a report of all products in the catalog. **View low inventory** produces a similar report, but containing only products low on inventory.
```
╔════════════╤══════════════════════╤══════════════╗
║    Stock # │ Product name         │ Qty in stock ║
╟────────────┼──────────────────────┼──────────────╢
║          1 │ ShamWow              │           13 ║
║          2 │ Snuggie              │           45 ║
 ...               
║         21 │ EGGstractor          │          100 ║
╚════════════╧══════════════════════╧══════════════╝
12 item(s)
```
**Add to inventory** adjusts inventory levels. First select the relevant product:
```
? Select an item (Use arrow keys)
>          1 | ShamWow              |           13
           2 | Snuggie              |           43
           3 | Chia Pet             |           11
(Move up and down to reveal more choices)
```
Then enter the amount to *add* to the current stock level (or enter a negative number to *subtract* from the current stock level).
```
? Enter quantity for 'ShamWow': 10
Your request is being processed.
Transaction complete.
```

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

    `columnWidths` specifies column sizes in characters (not including borders/separators). Specify a negative value to right-align a column.
 * `tableSeparator`

    Placeholder object that can be placed in the top-level array given to `displayTable()` which will render as a horizontal separator in the table.
 * `tableStyles` 

    Provides different styles tables may be rendered in: `dashes`, `inverse`, `inverseBorder`, `boxDrawing`, and `fattyBox`.
 * `tableize(columns, columnWidths)`
 
    Formats a single row into columns using the same column definitions as `displayTable()`.

Sample usage:

```javascript
// simple example
var rows = [ [1, 2, 3], [4, 5, 6], [7, 8, 9] ];
var columns = [10, 10, 10]; // 10 char column widths
emizunUtil.table.displayTable(rows, columns);

/* Output
-----------+------------+-----------
1          | 2          | 3
4          | 5          | 6
7          | 8          | 9
-----------+------------+-----------
*/


// complex example
var data = [
    {id: "ID", name: "NAME", price: "PRICE"},   // Header
    emizunUtil.table.tableSeparator,            // Separator
    {id: 0, name: "Magic Eraser", price: 8.99},
    {id: 1, name: "Swiffer", price: 14.99},
    {id: 2, name: "Simple Green", price: 3.99},
];
var columns = [-8, 30, -10];
var transform = function(item) { 
    // Convert each item to an array of column values
    return [
        item.id,
        item.name,
        // format numbers as $_.__
        (item.price.toFixed) ? ("$" + item.price.toFixed(2)) : item.price
    ];
};
emizunUtil.table.displayTable(data, columns,
    emizunUtil.table.tableStyles.fattyBox, transform);

/* Output
╔══════════╤════════════════════════════════╤════════════╗
║       ID │ NAME                           │      PRICE ║
╟──────────┼────────────────────────────────┼────────────╢
║        0 │ Magic Eraser                   │      $8.99 ║
║        1 │ Swiffer                        │     $14.99 ║
║        2 │ Simple Green                   │      $3.99 ║
╚══════════╧════════════════════════════════╧════════════╝
*/
```    

### emizun-util.prompt
The prompt object wraps inquirer and provides the following useful members.
 * `makeChoices().add(value, displayString, selectedDisplayString?)`

    Returns an object which may be passed to inquirer as a choice list. Multiple calls to `.add` may be chained.
 * `options`
 
    Provides a list of utility options that can be use to modify prompts: `validateNumber`, `validateInt`, `validateNotblank`. Alternatively, and object literal may be used to specify options for a prompt, e.g. `{default: 0}`. Multiple options objects may be combined by passing them in an array: `[prompt.options.validateInt, {default: 0}]`
 * `input(name, message, options?)`
 
    Defines an input prompt.
 * `list(name, message, choices, options?)` 

    Defines a list prompt. Choices should be an array containing string or choice objects or the choice list produced by `makeChoices().add()`.
 * `confirm(name, message, default?, options?)` 

    Defines a confirm prompt.

`input()`, `list()`, and `confirm()` may be chained to create a series of prompts. The return value is a `Prompt` object.

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
    .confirm('agree', 'Do you agree to the terms of use?', {default: false})
    .then(data => {
        // data = (e.g.) { name: 'steve', age: '30', language: 'en', agree: true}
    });
```