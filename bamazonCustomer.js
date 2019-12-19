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
        console.log(response.ItemId + ", " + response.quantity);
        connection.end();
    });
}