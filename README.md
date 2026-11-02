# StockWise Inventory Management System (MySQL)

A white-and-green inventory dashboard with product images, stock alerts, category chart, and CRUD operations connected to MySQL.

## Files
- `index.html` — website layout
- `style.css` — white/green responsive design
- `script.js` — UI, product images, and API calls
- `app.py` — Flask backend and MySQL API
- `schema.sql` — database and sample products
- `requirements.txt` — Python dependencies
- `.env.example` — example connection settings

## 1. Set up MySQL Workbench
1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `schema.sql` in Workbench, or copy/paste its contents into a SQL tab.
3. Click the lightning bolt to execute the script.
4. Refresh the Schemas panel. You should see `inventory_db` and its `products` table.
5. Run `SELECT * FROM inventory_db.products;` to verify the sample data.

The table uses the six fields requested: `product_id`, `product_name`, `category`, `price`, `quantity`, `reorder_level`.

## 2. Configure the connection
The backend defaults to host `localhost`, port `3306`, user `root`, database `inventory_db`, and an empty password. If your MySQL root account has a password, set it before running the app.

**Windows PowerShell (current terminal only):**
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:DB_NAME="inventory_db"
```
Replace `YOUR_MYSQL_PASSWORD` with your actual local MySQL password. Do not upload your password to GitHub.

## 3. Run the website
Install Python 3 if needed, then open a terminal in this project folder and run:
```bash
python -m venv .venv
```
Activate the environment:
- Windows PowerShell: `.\.venv\Scripts\Activate.ps1`
- macOS/Linux: `source .venv/bin/activate`

Then install dependencies and start the server:
```bash
pip install -r requirements.txt
python app.py
```
Open **http://127.0.0.1:5000** in your browser. Do not open `index.html` by double-clicking it for the MySQL-connected version; it should be served by Flask so the `/api/products` requests work.

## How pictures work
Product photos are displayed from image URLs in `script.js`, selected by product name (for common items) or category. The requested MySQL table stays limited to the six fields. Product photos require an internet connection. If you want to upload your own photos and save their paths in MySQL, add an `image_url` column and an upload feature later.

## Troubleshooting
- **Access denied:** verify `DB_USER` and `DB_PASSWORD`.
- **Can't connect to MySQL:** ensure the MySQL Server service is running and the port is correct (usually `3306`).
- **Unknown database:** execute `schema.sql` in Workbench.
- **No products displayed:** start Flask with `python app.py`, then refresh `http://127.0.0.1:5000`.
- **Module not found:** activate `.venv` and run `pip install -r requirements.txt`.
