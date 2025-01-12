// Simulating an order database with localStorage
let orderCount = localStorage.getItem("orderCount") ? parseInt(localStorage.getItem("orderCount")) : 0;

document.getElementById("orderForm").addEventListener("submit", function (event) {
    event.preventDefault();
    createOrder();
});

function createOrder() {
    const customerName = document.getElementById("customerName").value;
    const address = document.getElementById("address").value;
    const orderDate = document.getElementById("orderDate").value;
    const productsText = document.getElementById("products").value;

    // Generate a unique order ID and create order
    const orderId = orderCount + 1;
    const products = parseProducts(productsText);

    // Store order details in localStorage
    const orderDetails = {
        orderId,
        customerName,
        address,
        orderDate,
        products
    };

    // Save to a new "order log" every 50 orders
    saveOrderToLog(orderDetails);

    // Increment order count and save it
    orderCount++;
    localStorage.setItem("orderCount", orderCount);

    // Generate the order URL
    const orderUrl = `${window.location.href}?order=${orderId}`;
    document.getElementById("orderUrl").textContent = `Order URL: ${orderUrl}`;
    document.getElementById("orderResult").style.display = "block";
    document.getElementById("orderForm").reset();
}

function parseProducts(productsText) {
    const products = productsText.split(";").map(product => {
        const [name, quantity, price] = product.split(",");
        return { name, quantity: parseInt(quantity), price: parseFloat(price) };
    });
    return products;
}

function saveOrderToLog(orderDetails) {
    // Create log file for every 50 orders
    const logFile = Math.floor(orderCount / 50);
    let ordersLog = JSON.parse(localStorage.getItem(`ordersLog${logFile}`)) || [];
    ordersLog.push(orderDetails);
    localStorage.setItem(`ordersLog${logFile}`, JSON.stringify(ordersLog));
}

function generateCSV() {
    const orderId = getOrderIdFromUrl();
    const orderDetails = getOrderDetails(orderId);
    if (!orderDetails) return;

    let csvContent = "Order ID,Customer Name,Address,Order Date,Product Name,Quantity,Price,Total\n";
    orderDetails.products.forEach(product => {
        const total = product.quantity * product.price;
        csvContent += `${orderId},${orderDetails.customerName},${orderDetails.address},${orderDetails.orderDate},${product.name},${product.quantity},${product.price},${total}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_${orderId}.csv`;
    link.click();
}

function getOrderIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("order");
}

function getOrderDetails(orderId) {
    // Check all log files for the order details
    let orderDetails = null;
    for (let i = 0; i <= Math.floor(orderCount / 50); i++) {
        const ordersLog = JSON.parse(localStorage.getItem(`ordersLog${i}`)) || [];
        orderDetails = ordersLog.find(order => order.orderId == orderId);
        if (orderDetails) break;
    }
    return orderDetails;
}

function displayInvoice() {
    const orderId = getOrderIdFromUrl();
    const orderDetails = getOrderDetails(orderId);
    if (!orderDetails) {
        alert("Order not found!");
        return;
    }

    const invoiceContent = generateInvoiceContent(orderDetails);
    document.getElementById("invoiceDetails").textContent = invoiceContent;
    document.getElementById("orderView").style.display = "block";
}

function generateInvoiceContent(orderDetails) {
    let invoice = `INVOICE\n`;
    invoice += `--------------------------\n`;
    invoice += `Order ID: ${orderDetails.orderId}\n`;
    invoice += `Date: ${orderDetails.orderDate}\n`;
    invoice += `Customer: ${orderDetails.customerName}\n`;
    invoice += `Address: ${orderDetails.address}\n`;
    invoice += `--------------------------\n`;

    let totalAmount = 0;
    orderDetails.products.forEach(product => {
        const total = product.quantity * product.price;
        totalAmount += total;
        invoice += `${product.name} - ${product.quantity} x ${product.price} = ${total}\n`;
    });

    invoice += `--------------------------\n`;
    invoice += `Total: ${totalAmount}\n`;
    return invoice;
}

// Automatically show invoice when visiting URL
if (window.location.search.includes("order")) {
    displayInvoice();
}

