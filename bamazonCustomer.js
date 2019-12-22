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
    showStoreItems();
});

function showStoreItems() {
    console.log("Retrieving Store Information....\n");
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Product #: " + res[i].item_id + "\nItem: " + res[i].product_name + "\nPrice: " + res[i].price);
            console.log("\n ----------------------------- \n");
        }
        selectItemToBuy();
    });
}

function selectItemToBuy() {
    inquirer.prompt([{
        name: "ItemId",
        type: "number",
        message: "Please enter the Product # of the item you would like to buy:"
    }, {
        name: "quantity",
        type: "number",
        message: "Please enter how many of this item you would like to purchase:"
    }]).then(function(response) {
        checkQuantity(response.ItemId, response.quantity);
    });
}

function checkQuantity(id, quantity) {
    connection.query("SELECT * FROM products WHERE item_id=?", [id], function(err, res) {
        if (err) throw err;
        if (res[0].stock_quantity >= quantity) {
            completeOrder(id, quantity, res[0].stock_quantity, res[0].price);
        } else {
            console.log("There is not enough stock to fulfill this order. The current inventory is: " +
                res[0].stock_quantity + 
                ". Please try again.");
            selectItemToBuy();
        }
    });
}

function completeOrder(id, quantity, stock, price) {
    var newQuantity = stock - quantity;
    connection.query("UPDATE products SET ? WHERE item_id=?", 
        [{ stock_quantity: newQuantity }, id], 
        function(err, res) {
            if (err) throw err;
            var total = price * quantity;
            console.log("Thank you for your order!");
            console.log("Your total comes to: $" + total + ".");
            getNewSales(id, total);
    });
}

function getNewSales(id, total) {
    connection.query("SELECT product_sales FROM products WHERE item_id=?", [id], function(err, res) {
        if (err) throw err;
        var newSales = res[0].product_sales + total;
        updateSales(id, newSales);
    });
}

function updateSales(id, newSales) {
    connection.query("UPDATE products SET ? WHERE item_id=?",
        [{ product_sales: newSales }, id],
        function(err, res) {
            if(err) throw err;
            connection.end();
        });
}