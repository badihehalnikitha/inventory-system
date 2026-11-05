const API_BASE = "https://inventory-system-nqba.onrender.com/api/products";
const fallbackImages = {
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=160&q=80",
  accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=80",
  stationery: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=160&q=80",
  "home & living": "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=160&q=80",
  fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=160&q=80"
};
const namedImages = [
  { match: /headphone|headset|earphone/i, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=160&q=80" },
  { match: /backpack|bag/i, url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=80" },
  { match: /mug|cup|coffee/i, url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=160&q=80" },
  { match: /notebook|book|stationery|pen/i, url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=160&q=80" },
  { match: /watch/i, url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&q=80" },
  { match: /plant|pot/i, url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=160&q=80" },
  { match: /laptop|computer|monitor/i, url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=160&q=80" },
  { match: /phone|mobile/i, url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=160&q=80" },
  { match: /shoe|sneaker/i, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&q=80" }
];
let products = [];
let toastTimer;

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
}
function isLow(product) { return Number(product.quantity) <= Number(product.reorder_level); }
function imageFor(product) {
  const named = namedImages.find(item => item.match.test(product.product_name || ""));
  return named?.url || fallbackImages[String(product.category || "").toLowerCase()] || "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=160&q=80";
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function productImage(product, cls = "product-thumb") {
  return `<img class="${cls}" src="${escapeHTML(imageFor(product))}" alt="${escapeHTML(product.product_name)}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=160&q=80'">`;
}
function statusBadge(product) {
  return isLow(product) ? '<span class="status-pill status-low">Low stock</span>' : '<span class="status-pill status-in">In stock</span>';
}
function getCategories() {
  return [...new Set(products.map(p => String(p.category).trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b));
}
function populateCategories() {
  [document.getElementById("dashboardCategory"), document.getElementById("productsCategory")].forEach(select => {
    const previous = select.value;
    select.innerHTML = `<option value="">All categories</option>` + getCategories().map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
    select.value = previous;
  });
  document.getElementById("categoryOptions").innerHTML = [...new Set([...getCategories(), "Electronics", "Accessories", "Stationery", "Home & Living", "Fashion"])].map(c => `<option value="${escapeHTML(c)}"></option>`).join("");
}
function renderStats() {
  document.getElementById("totalProducts").textContent = products.length.toLocaleString("en-IN");
  document.getElementById("totalUnits").textContent = products.reduce((sum,p) => sum + Number(p.quantity), 0).toLocaleString("en-IN");
  document.getElementById("inventoryValue").textContent = money(products.reduce((sum,p) => sum + Number(p.price) * Number(p.quantity), 0));
  const low = products.filter(isLow);
  document.getElementById("lowStockCount").textContent = low.length;
  document.getElementById("navProductCount").textContent = products.length;
  document.getElementById("alertBadge").textContent = low.length;
  document.getElementById("alertsPageCount").textContent = `${low.length} item${low.length === 1 ? "" : "s"}`;
}
function productCardRow(product) {
  return `<tr><td><div class="product-cell">${productImage(product)}<div><span class="product-name">${escapeHTML(product.product_name)}</span><span class="product-category">${escapeHTML(product.category)}</span></div></div></td>
  <td class="price">${money(product.price)}</td><td class="quantity-cell">${Number(product.quantity).toLocaleString("en-IN")} units</td><td>${statusBadge(product)}</td>
  <td><button class="row-action" data-action="edit" data-id="${product.product_id}" title="Edit product" aria-label="Edit ${escapeHTML(product.product_name)}">✎</button></td></tr>`;
}
function renderDashboardProducts() {
  const query = document.getElementById("dashboardSearch").value.trim().toLowerCase();
  const category = document.getElementById("dashboardCategory").value;
  const filtered = products.filter(p => (p.product_name.toLowerCase().includes(query) || String(p.product_id).includes(query)) && (!category || p.category === category)).slice(0, 5);
  document.getElementById("dashboardProducts").innerHTML = filtered.map(productCardRow).join("");
  document.getElementById("dashboardEmpty").classList.toggle("hidden", filtered.length > 0);
  document.querySelector(".products-panel .table-wrap").classList.toggle("hidden", filtered.length === 0);
}
function renderAllProducts() {
  const query = document.getElementById("productsSearch").value.trim().toLowerCase();
  const category = document.getElementById("productsCategory").value;
  const status = document.getElementById("productsStatus").value;
  const filtered = products.filter(p => {
    const matchesQuery = p.product_name.toLowerCase().includes(query) || String(p.product_id).includes(query) || p.category.toLowerCase().includes(query);
    const matchesCategory = !category || p.category === category;
    const matchesStatus = !status || (status === "low" ? isLow(p) : !isLow(p));
    return matchesQuery && matchesCategory && matchesStatus;
  });
  document.getElementById("allProductsBody").innerHTML = filtered.map(p => `<tr>
    <td><div class="product-cell">${productImage(p)}<div><span class="product-name">${escapeHTML(p.product_name)}</span><span class="product-category">${escapeHTML(p.category)}</span></div></div></td>
    <td>#${p.product_id}</td><td>${escapeHTML(p.category)}</td><td class="price">${money(p.price)}</td><td class="quantity-cell">${Number(p.quantity).toLocaleString("en-IN")}</td><td>${Number(p.reorder_level).toLocaleString("en-IN")}</td><td>${statusBadge(p)}</td>
    <td><div class="action-group"><button class="action-button" data-action="edit" data-id="${p.product_id}">Edit</button><button class="action-button delete" data-action="delete" data-id="${p.product_id}">Delete</button></div></td>
  </tr>`).join("");
  document.getElementById("productsEmpty").classList.toggle("hidden", filtered.length > 0);
  document.querySelector(".full-products-panel .table-wrap").classList.toggle("hidden", filtered.length === 0);
  document.getElementById("productCountLabel").textContent = `Showing ${filtered.length} of ${products.length} product${products.length === 1 ? "" : "s"}`;
}
function renderCategoryChart() {
  const totals = {};
  products.forEach(p => totals[p.category] = (totals[p.category] || 0) + Number(p.quantity));
  const entries = Object.entries(totals).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...entries.map(entry => entry[1]), 1);
  document.getElementById("categoryChart").innerHTML = entries.length ? entries.map(([name,qty]) => `<div class="category-row"><div class="category-label"><span>${escapeHTML(name)}</span><strong>${qty.toLocaleString("en-IN")}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,qty/max*100)}%"></div></div></div>`).join("") : '<p class="subheading">Add products to see category distribution.</p>';
}
function alertMarkup(product) {
  return `<div class="alert-item">${productImage(product)}<div class="alert-info"><strong>${escapeHTML(product.product_name)}</strong><small>${escapeHTML(product.category)} · ID #${product.product_id}</small></div><div class="alert-qty"><strong>${Number(product.quantity)} left</strong><small>Reorder at ${Number(product.reorder_level)}</small></div><button class="row-action" data-action="edit" data-id="${product.product_id}" title="Update stock">✎</button></div>`;
}
function renderAlerts() {
  const low = products.filter(isLow).sort((a,b) => Number(a.quantity)-Number(b.quantity));
  document.getElementById("dashboardAlerts").innerHTML = low.slice(0, 4).map(alertMarkup).join("");
  document.getElementById("allAlerts").innerHTML = low.map(alertMarkup).join("");
  document.getElementById("alertsEmpty").classList.toggle("hidden", low.length > 0);
  document.getElementById("allAlerts").classList.toggle("hidden", low.length === 0);
}
function render() { populateCategories(); renderStats(); renderDashboardProducts(); renderAllProducts(); renderCategoryChart(); renderAlerts(); }
function showToast(message) {
  const toast = document.getElementById("toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function switchView(view) {
  ["dashboard", "products", "alerts"].forEach(name => document.getElementById(name + "View").classList.toggle("hidden", name !== view));
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  document.getElementById("breadcrumbPage").textContent = view === "dashboard" ? "Dashboard" : view === "products" ? "Products" : "Stock alerts";
  document.getElementById("sidebar").classList.remove("open");
}
function openModal(product = null) {
  document.getElementById("productForm").reset();
  document.getElementById("editingId").value = product ? product.product_id : "";
  document.getElementById("productId").value = product ? product.product_id : nextProductId();
  document.getElementById("productId").disabled = Boolean(product);
  document.getElementById("productName").value = product ? product.product_name : "";
  document.getElementById("productCategory").value = product ? product.category : "";
  document.getElementById("productPrice").value = product ? product.price : "";
  document.getElementById("productQuantity").value = product ? product.quantity : "";
  document.getElementById("productReorder").value = product ? product.reorder_level : 10;
  document.getElementById("modalTitle").textContent = product ? "Update product" : "Add a product";
  document.getElementById("productModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("productName").focus(), 50);
}
function closeModal() { document.getElementById("productModal").classList.add("hidden"); document.getElementById("productId").disabled = false; }
function nextProductId() { return products.length ? Math.max(...products.map(p => Number(p.product_id) || 0)) + 1 : 1001; }
function editProduct(id) { const product = products.find(p => Number(p.product_id) === Number(id)); if (product) openModal(product); }
async function apiRequest(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  let data = {};
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
async function refreshProducts() {
  try {
    products = await apiRequest(API_BASE);
    render();
  } catch (error) {
    showToast("Please start the Node.js server first!");
    console.error(error);
  }
}
async function deleteProduct(id) {
  const product = products.find(p => Number(p.product_id) === Number(id));
  if (!product || !confirm(`Delete "${product.product_name}" (ID #${product.product_id})? This cannot be undone.`)) return;
  try {
    await apiRequest(`${API_BASE}/${id}`, { method: "DELETE" });
    await refreshProducts(); showToast("Product deleted from MySQL successfully.");
  } catch (error) { showToast(error.message); }
}
async function handleSubmit(event) {
  event.preventDefault();
  const editingId = document.getElementById("editingId").value;
  const payload = {
    product_id: Number(document.getElementById("productId").value),
    product_name: document.getElementById("productName").value.trim(),
    category: document.getElementById("productCategory").value.trim(),
    price: Number(document.getElementById("productPrice").value),
    quantity: Number(document.getElementById("productQuantity").value),
    reorder_level: Number(document.getElementById("productReorder").value)
  };
  if (!Number.isInteger(payload.product_id) || payload.product_id <= 0) return showToast("Product ID must be a positive whole number.");
  if (!payload.product_name || !payload.category) return showToast("Please enter the product name and category.");
  if (![payload.price, payload.quantity, payload.reorder_level].every(Number.isFinite) || payload.price < 0 || payload.quantity < 0 || payload.reorder_level < 0 || !Number.isInteger(payload.quantity) || !Number.isInteger(payload.reorder_level)) return showToast("Enter a valid price and non-negative whole-number stock values.");
  try {
    if (editingId) {
      await apiRequest(`${API_BASE}/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiRequest(API_BASE, { method: "POST", body: JSON.stringify(payload) });
    }
    await refreshProducts(); closeModal(); showToast(editingId ? "Product updated in MySQL." : "Product added to MySQL.");
  } catch (error) { showToast(error.message); }
}
document.getElementById("productForm").addEventListener("submit", handleSubmit);
["addProductBtn","addProductBtn2","helpAddBtn","emptyAddBtn","productsEmptyAdd","alertAddBtn"].forEach(id => document.getElementById(id).addEventListener("click", () => openModal()));
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
document.getElementById("productModal").addEventListener("click", event => { if (event.target.id === "productModal") closeModal(); });
document.getElementById("dashboardSearch").addEventListener("input", renderDashboardProducts);
document.getElementById("dashboardCategory").addEventListener("change", renderDashboardProducts);
["productsSearch","productsCategory","productsStatus"].forEach(id => document.getElementById(id).addEventListener(id === "productsSearch" ? "input" : "change", renderAllProducts));
document.getElementById("viewAllBtn").addEventListener("click", () => switchView("products"));
document.getElementById("viewAlertsBtn").addEventListener("click", () => switchView("alerts"));
document.getElementById("topAlertBtn").addEventListener("click", () => switchView("alerts"));
document.getElementById("mobileMenu").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]"); if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "edit") editProduct(id);
  if (button.dataset.action === "delete") deleteProduct(id);
});
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
refreshProducts();
async function loadProducts() {
    const response = await fetch("/api/products");
    const products = await response.json();

    console.log(products);
}

loadProducts();
