# Emizun

Make all your text-based imaginary shopping simple with Emizun!

![Emizun.js - Command-line shopping made ez!](/images/logo.png)

Emizun is a CLI application that provides a make-pretend store-front for make-pretend people to buy make-pretend products. Emizun runs on Node.js and requires a mySQL database.

----

Emizun exposes three command-line interfaces. More information on each interface is available below.
 * `emizunCustomer.js` - Allows customers to browse and purchase from the available inventory.
 * `emizunSupervisor.js` - Provides inventory reporting functionality.
 * `emizunManager.js` - Provides inventory management functionality. 

Emizun defines three additional modules:
 * `prompt.js` - Provides a streamlined programming interface for `inquirer`.
 * `table.js` - Provides table formatting and rendering.
 * `EmizunConnection.js` - Manages mySQL connection.

Other files of note:
 * `emizunDB.json` - Defines database connection parameters. By default this references a mySQL server running locally.
 * `emizun.sql` - Initializes databse. Creates database, tables, and some initial data.

---

## `emizunCustomer.js`
```
? Select a product
  1        | ShamWow              | $19.95
> 2        | Snuggie              | $19.80
  3        | Chia Pet             | $15.97
  4        | My Pillow            | $39.95
```
`emizunCustomer.js` defines and uses the `EmizunCustomer` class, which provides an interactive shopping session allowing a user to select products and quantities.

## `emizunSupervisor.js`
```
╔══════════╤══════════════════════╤════════════╤════════════╤════════════╗
║  Dept ID │ Dept Name            │   Overhead │      Gross │     Profit ║
╟──────────┼──────────────────────┼────────────┼────────────┼────────────╢
║        2 │ Clothing             │  $20000.00 │  $59020.94 │  $39020.94 ║
║        1 │ Health & Wellness    │  $10000.00 │   $1992.95 │  $-8007.05 ║
╚══════════╧══════════════════════╧════════════╧════════════╧════════════╝
```
`emizunSupervisor.js` defines and uses the `EmizunSupervisor` class, which provides an interactive inventory reporting session. The user may request a report on profits by department and may register departments to be included in the report.

## `emizunManager.js`
```
╔════════════╤══════════════════════╤══════════════╗
║    Stock # │ Product name         │ Qty in stock ║
╟────────────┼──────────────────────┼──────────────╢
║          1 │ ShamWow              │           13 ║
║          2 │ Snuggie              │           45 ║
```
`emizunManager.js` defines and uses the `EmizunManager` class, which provides an interactive inventory management session. The user may request a report on current inventory (optionally filtered for products with low inventory), adjust inventory levels, and add new items to the product catalog.


