# 📦 StockWise – Inventory Management System

A web-based Inventory Management System built to help businesses manage products, monitor stock levels, track inventory value, and identify products that need restocking.

StockWise provides a clean, responsive white-and-green dashboard with product images, category charts, search functionality, stock alerts, and CRUD operations.

## 🚀 Features

- **Dashboard:** View total products, available stock, inventory value, and low-stock items.
- **Product Management:** Add, view, update, and delete products.
- **Product Images:** Display images for inventory products.
- **Search Functionality:** Search products by name.
- **Category Filtering:** Filter products based on categories.
- **Low-Stock Alerts:** Identify products whose quantity reaches or falls below the reorder level.
- **Inventory Analytics:** View stock information and category-wise charts.
- **Responsive Design:** Access the application on different screen sizes.

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MySQL

### Tools
- Visual Studio Code
- MySQL Workbench
- Git and GitHub

## 📁 Project Structure

```text
inventory-system/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── config/
│   └── db.js
│
├── server.js
├── package.json
├── package-lock.json
├── schema.sql
├── .env.example
├── .gitignore
└── README.md
```

*Note: Adjust the folder structure above to match your actual project files.*

## 🗄️ Database Setup

1. Open MySQL Workbench.
2. Connect to your local MySQL server.
3. Open the `schema.sql` file.
4. Execute the SQL script.
5. Verify that the `inventory_db` database and `products` table have been created.

### Products Table

| Column | Description |
|---|---|
| product_id | Unique product ID |
| product_name | Name of the product |
| category | Product category |
| price | Product price |
| quantity | Available stock |
| reorder_level | Minimum stock threshold |

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project Folder

```bash
cd inventory-system
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=inventory_db
DB_PORT=3306
PORT=3000
```

Replace `YOUR_MYSQL_PASSWORD` with your local MySQL password.

**Important:** Never upload your actual `.env` file or database password to GitHub.

### 5. Start the Application

```bash
node server.js
```

If your project uses a configured npm start script, you can also run:

```bash
npm start
```

### 6. Open in Browser

```text
http://localhost:3000
```

## 🔗 REST API Endpoints

The backend uses Express.js to handle REST API requests.

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Retrieve all products |
| POST | `/api/products` | Add a new product |
| PUT | `/api/products/:id` | Update product details |
| DELETE | `/api/products/:id` | Delete a product |

## 🔄 How It Works

1. Users interact with the frontend through the dashboard.
2. JavaScript sends HTTP requests to the backend.
3. Node.js and Express.js process the API requests.
4. The backend communicates with MySQL to retrieve or modify product information.
5. The API returns a response to the frontend.
6. The dashboard displays the updated inventory information.

## 📊 Inventory Management Logic

- Total Products: Counts the number of product records.
- Total Stock: Calculates the sum of available product quantities.
- Inventory Value: Calculates the total value using price × quantity.
- Low Stock: Identifies products where quantity is less than or equal to reorder level.

## 🔮 Future Enhancements

- User authentication and authorization.
- Admin and staff roles.
- Inventory transaction history.
- Product image upload.
- Sales and purchase reports.
- Cloud deployment.

## 👩‍💻 Author

**Nikitha Badinehal**

Computer Science Undergraduate



---

⭐ If you find this project useful, consider giving it a star!
