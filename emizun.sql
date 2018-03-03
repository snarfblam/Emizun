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