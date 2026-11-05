
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(__dirname));

// Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Cloud MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// GET: Display all products
app.get("/api/products", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products ORDER BY product_id"
        );

        res.status(200).json(products);
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ message: "Unable to fetch products" });
    }
});

// POST: Add a new product
app.post("/api/products", async (req, res) => {
    try {
        const {
            product_id,
            product_name,
            category,
            price,
            quantity,
            reorder_level
        } = req.body;

        if (
            product_id === undefined ||
            !product_name ||
            !category ||
            price === undefined ||
            quantity === undefined ||
            reorder_level === undefined
        ) {
            return res.status(400).json({
                message: "Please provide all product details"
            });
        }

        const id = Number(product_id);
        const productPrice = Number(price);
        const productQuantity = Number(quantity);
        const reorderLevel = Number(reorder_level);

        if (
            !Number.isInteger(id) ||
            id <= 0 ||
            !Number.isFinite(productPrice) ||
            productPrice < 0 ||
            !Number.isInteger(productQuantity) ||
            productQuantity < 0 ||
            !Number.isInteger(reorderLevel) ||
            reorderLevel < 0
        ) {
            return res.status(400).json({
                message: "Please enter valid product values"
            });
        }

        const sql = `
            INSERT INTO products
            (product_id, product_name, category, price, quantity, reorder_level)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.execute(sql, [
            id,
            product_name.trim(),
            category.trim(),
            productPrice,
            productQuantity,
            reorderLevel
        ]);

        res.status(201).json({
            message: "Product added successfully"
        });

    } catch (error) {
        console.error("Insert error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Product ID already exists"
            });
        }

        res.status(500).json({
            message: "Unable to add product"
        });
    }
});

// PUT: Update an existing product
app.put("/api/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            product_name,
            category,
            price,
            quantity,
            reorder_level
        } = req.body;

        if (
            !Number.isInteger(id) ||
            id <= 0 ||
            !product_name ||
            !category ||
            price === undefined ||
            quantity === undefined ||
            reorder_level === undefined
        ) {
            return res.status(400).json({
                message: "Please provide valid product details"
            });
        }

        const productPrice = Number(price);
        const productQuantity = Number(quantity);
        const reorderLevel = Number(reorder_level);

        if (
            !Number.isFinite(productPrice) ||
            productPrice < 0 ||
            !Number.isInteger(productQuantity) ||
            productQuantity < 0 ||
            !Number.isInteger(reorderLevel) ||
            reorderLevel < 0
        ) {
            return res.status(400).json({
                message: "Please enter valid product values"
            });
        }

        const sql = `
            UPDATE products
            SET product_name = ?,
                category = ?,
                price = ?,
                quantity = ?,
                reorder_level = ?
            WHERE product_id = ?
        `;

        const [result] = await db.execute(sql, [
            product_name.trim(),
            category.trim(),
            productPrice,
            productQuantity,
            reorderLevel,
            id
        ]);

        if (result.affectedRows === 0) {
            const [existing] = await db.execute(
                "SELECT product_id FROM products WHERE product_id = ?",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }
        }

        res.status(200).json({
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Update error:", error);

        res.status(500).json({
            message: "Unable to update product"
        });
    }
});

// DELETE: Delete a product
app.delete("/api/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const [result] = await db.execute(
            "DELETE FROM products WHERE product_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            message: "Unable to delete product"
        });
    }
});

// Start server after checking database connection
async function startServer() {
    try {
        const connection = await db.getConnection();

        console.log("MySQL connected successfully!");

        connection.release();

        app.listen(PORT, () => {
            console.log(`StockWise server running on port ${PORT}`);
            console.log(`Open http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MySQL connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
