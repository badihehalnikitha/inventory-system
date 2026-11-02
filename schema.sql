-- Run this script in MySQL Workbench.
CREATE DATABASE IF NOT EXISTS inventory_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE inventory_db;

CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0)
);

-- Optional sample records so the dashboard has data on first launch.
INSERT IGNORE INTO products
    (product_id, product_name, category, price, quantity, reorder_level)
VALUES
    (1001, 'Wireless Headphones', 'Electronics', 2499.00, 24, 8),
    (1002, 'Everyday Backpack', 'Accessories', 1899.00, 6, 10),
    (1003, 'Ceramic Coffee Mug', 'Home & Living', 399.00, 42, 12),
    (1004, 'Notebook Set', 'Stationery', 249.00, 5, 10),
    (1005, 'Smart Watch', 'Electronics', 4299.00, 18, 6),
    (1006, 'Desk Plant Pot', 'Home & Living', 549.00, 3, 8);

SELECT * FROM products;
