create database emizun;
use emizun;

CREATE TABLE products (
	item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(255),
    department_name VARCHAR(255),
    price INTEGER(11),
    stock_quantity INTEGER(11),
    PRIMARY KEY (item_id)
);

ALTER TABLE products
ADD COLUMN product_sales INTEGER(11) AFTER stock_quantity;

INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('1', 'ShamWow', 'Home & Kitchen', '1995', '20');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('2', 'Snuggie', 'Home & Kitchen', '1980', '50');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('3', 'Chia Pet', 'Garden & Outdoor', '1597', '30');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('4', 'My Pillow', 'Health & Wellness', '3995', '20');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('5', 'Comfort Click Belt', 'Clothing', '2997', '33');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('6', 'Head On', 'Health & Wellness', '1995', '40');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('7', 'The Clapper', 'Electronics', '1575', '22');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('8', 'Mighty Putty', 'Tools & Home Improvement', '1549', '60');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('9', 'Flex Seal', 'Tools & Home Improvement', '1299', '30');
INSERT INTO `emizun`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES ('10', 'Music Bullet', 'Electronics', '2499', '40');

UPDATE products SET product_sales='0';
UPDATE products SET product_sales='0' WHERE item_id >= 0;


CREATE TABLE departments (
    department_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    overhead_costs INTEGER(11) NOT NULL,
    PRIMARY KEY (department_id)
);

INSERT INTO emizun.departments (department_name, overhead_costs) VALUES ('Health & Wellness', '10000');

SELECT 
	department_id,
    departments.department_name, 
    overhead_costs,
    SUM(product_sales) AS department_sales,
    (SUM(product_sales) - overhead_costs) AS total_profit
FROM 
	products 
		INNER JOIN 
	departments USING (department_name) 
GROUP BY department_name;