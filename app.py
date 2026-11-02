import os
from decimal import Decimal, InvalidOperation

from flask import Flask, jsonify, request, send_from_directory
import mysql.connector
from mysql.connector import Error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")

def db_connection():
    """Connect to the MySQL database using environment variables."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "inventory_db"),
    )

def serialize(row):
    return {
        "product_id": row["product_id"],
        "product_name": row["product_name"],
        "category": row["category"],
        "price": float(row["price"]),
        "quantity": row["quantity"],
        "reorder_level": row["reorder_level"],
    }

def validate_product(data):
    required = ["product_id", "product_name", "category", "price", "quantity", "reorder_level"]
    missing = [field for field in required if field not in data or data[field] is None]
    if missing:
        return None, f"Missing required field(s): {', '.join(missing)}"
    try:
        product_id = int(data["product_id"])
        quantity = int(data["quantity"])
        reorder_level = int(data["reorder_level"])
        price = Decimal(str(data["price"]))
    except (ValueError, TypeError, InvalidOperation):
        return None, "Product ID, quantity and reorder level must be whole numbers, and price must be numeric."
    if product_id <= 0 or quantity < 0 or reorder_level < 0 or not price.is_finite() or price < 0:
        return None, "ID must be positive; price, quantity and reorder level cannot be negative."
    if isinstance(data["product_id"], bool) or isinstance(data["quantity"], bool) or isinstance(data["reorder_level"], bool):
        return None, "ID, quantity and reorder level must be whole numbers."
    name = str(data["product_name"]).strip()
    category = str(data["category"]).strip()
    if not name or not category:
        return None, "Product name and category are required."
    if len(name) > 100 or len(category) > 50:
        return None, "Product name must be 100 characters or fewer and category 50 characters or fewer."
    if price.as_tuple().exponent < -2:
        return None, "Price can have at most two decimal places."
    return {
        "product_id": product_id, "product_name": name, "category": category,
        "price": price, "quantity": quantity, "reorder_level": reorder_level
    }, None

@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.get("/api/products")
def get_products():
    connection = None
    cursor = None
    try:
        connection = db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT product_id, product_name, category, price, quantity, reorder_level FROM products ORDER BY product_id DESC")
        return jsonify([serialize(row) for row in cursor.fetchall()])
    except Error as exc:
        app.logger.exception("Database read failed")
        return jsonify({"error": "Could not read products from MySQL. Check your database setup and credentials."}), 500
    finally:
        if cursor: cursor.close()
        if connection and connection.is_connected(): connection.close()

@app.post("/api/products")
def create_product():
    data, error = validate_product(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400
    connection = None
    cursor = None
    try:
        connection = db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """INSERT INTO products (product_id, product_name, category, price, quantity, reorder_level)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (data["product_id"], data["product_name"], data["category"], data["price"], data["quantity"], data["reorder_level"])
        )
        connection.commit()
        return jsonify({"message": "Product created", "product_id": data["product_id"]}), 201
    except mysql.connector.IntegrityError:
        if connection: connection.rollback()
        return jsonify({"error": f"Product ID {data['product_id']} already exists."}), 409
    except Error:
        if connection: connection.rollback()
        app.logger.exception("Database insert failed")
        return jsonify({"error": "Could not save product to MySQL. Check the database connection."}), 500
    finally:
        if cursor: cursor.close()
        if connection and connection.is_connected(): connection.close()

@app.put("/api/products/<int:product_id>")
def update_product(product_id):
    data, error = validate_product(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400
    if data["product_id"] != product_id:
        return jsonify({"error": "Product ID cannot be changed while updating."}), 400
    connection = None
    cursor = None
    try:
        connection = db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """UPDATE products SET product_name=%s, category=%s, price=%s, quantity=%s, reorder_level=%s
               WHERE product_id=%s""",
            (data["product_name"], data["category"], data["price"], data["quantity"], data["reorder_level"], product_id)
        )
        connection.commit()
        if cursor.rowcount == 0:
            # Check existence because rowcount may be zero if values are unchanged.
            cursor.execute("SELECT product_id FROM products WHERE product_id=%s", (product_id,))
            if cursor.fetchone() is None:
                return jsonify({"error": "Product not found."}), 404
        return jsonify({"message": "Product updated"})
    except Error:
        if connection: connection.rollback()
        app.logger.exception("Database update failed")
        return jsonify({"error": "Could not update product in MySQL."}), 500
    finally:
        if cursor: cursor.close()
        if connection and connection.is_connected(): connection.close()

@app.delete("/api/products/<int:product_id>")
def delete_product(product_id):
    connection = None
    cursor = None
    try:
        connection = db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM products WHERE product_id=%s", (product_id,))
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found."}), 404
        return jsonify({"message": "Product deleted"})
    except Error:
        if connection: connection.rollback()
        app.logger.exception("Database delete failed")
        return jsonify({"error": "Could not delete product from MySQL."}), 500
    finally:
        if cursor: cursor.close()
        if connection and connection.is_connected(): connection.close()

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
