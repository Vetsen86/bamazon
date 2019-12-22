var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Scimayasa12",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId);
    showOptions();
});

function showOptions() {
    inquirer.prompt({
        name: "menu",
        type: "list",
        message: "Welcome, Bamazon manager! Please select from the options below:",
        choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Exit"]
    }).then(function(response) {
        switch (response.menu) {
            case "View products for sale":
                showAllProducts();
                break;
            case "View low inventory":
                showLowInventory();
                break;
            case "Add to inventory":
                addInventory();
                break;
            case "Add new product":
                addProduct();
                break;
            case "Exit":
                console.log("Have a good day.");
                connection.end();
        }
    });
}

function showAllProducts() {
    console.log("Retrieving Store Information....\n");
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Product #: " + res[i].item_id + 
                "\nItem: " + res[i].product_name + 
                "\nPrice: " + res[i].price + 
                "\nRemaining Inventory: " + res[i].stock_quantity);
            console.log("\n ----------------------------- \n");
        }
        showOptions();
    });
}

function showLowInventory() {
    console.log("Performing low inventory search...\n");
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Product #: " + res[i].item_id + 
                "\nItem: " + res[i].product_name + 
                "\nPrice: " + res[i].price + 
                "\nRemaining Inventory: " + res[i].stock_quantity);
            console.log("\n ----------------------------- \n");
        }
        showOptions();
    });
}

function addInventory() {
    inquirer.prompt([{
        name: "id",
        type: "number",
        message: "Please enter the id of the item you would like to restock:"
    }, {
        name: "quantity",
        type: "number",
        message: "Please enter how many of the item you would like to restock:"
    }]).then(function(response) {
        connection.query("SELECT stock_quantity FROM products WHERE item_id=?", [response.id], function (err, res) {
            if (err) throw err;
            var newQuantity = res[0].stock_quantity + response.quantity;
            updateInventory(response.id, newQuantity);
        });
    });
}

function updateInventory(id, newStock) {
    connection.query("UPDATE products SET ? WHERE item_id=?",
        [{ stock_quantity: newStock }, id],
        function (err, res) {
            if (err) throw err;
            console.log("New Inventory: " + newStock);
            showOptions();
        });
}

function addProduct() {
    inquirer.prompt([{
        name: "product",
        type: "input",
        message: "What is the name of the item you would like to add?"
    }, {
        name: "department",
        type: "input",
        message: "What is the department of the item?"
    }, {
        name: "price",
        type: "number",
        message: "How much does the item cost?"
    }, {
        name: "stock",
        type: "number",
        message: "How many of the item would you like to stock?"
    }]).then(function(response) {
        connection.query("INSERT INTO products SET ?",
        {
            product_name: response.product,
            department_name: response.department,
            price: response.price,
            stock_quantity: response.stock,
            product_sales: 0
        }, 
        function(err, res) {
            if (err) throw err;
            console.log("Product Added!");
            showOptions();
        });
    });
}