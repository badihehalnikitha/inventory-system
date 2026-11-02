require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve HTML, CSS and JavaScript files
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
    queueLimit: 0,
    ssl: process.env.DB_SSL === "true"
        ? { rejectUnauthorized: true }
        : undefined
});


// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("Connected to inventorysystem successfully!");
    connection.release();
});

// Display all products
app.get("/api/products", (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Insert a product
app.post("/api/products", (req, res) => {
    const {
        product_name, category, price, quantity, reorder_level
    } = req.body;

    const sql = `INSERT INTO products
        (product_name, category, price, quantity, reorder_level)
        VALUES (?, ?, ?, ?, ?)`;

    db.query(sql,
        [product_name, category, price, quantity, reorder_level],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                message: "Product inserted successfully",
                product_id: result.insertId
            });
        }
    );
});

// Update a product
app.put("/api/products/:id", (req, res) => {
    const {
        product_name, category, price, quantity, reorder_level
    } = req.body;

    const sql = `UPDATE products SET
        product_name = ?, category = ?, price = ?,
        quantity = ?, reorder_level = ?
        WHERE product_id = ?`;

    db.query(sql,
        [product_name, category, price, quantity, reorder_level, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Product not found" });
            }

            res.json({ message: "Product updated successfully" });
        }
    );
});

// Delete a product
app.delete("/api/products/:id", (req, res) => {
    db.query(
        "DELETE FROM products WHERE product_id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Product not found" });
            }

            res.json({ message: "Product deleted successfully" });
        }
    );
});

// Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
