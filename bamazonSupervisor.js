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
        message: "Welcome, Supervisor! What would you like to do?",
        choices: ["View product sales by department", "Create new department", "Exit"]
    }).then(function(response) {
        switch (response.menu) {
            case "View product sales by department":
                viewProductSales();
                break;
            case "Create new department":
                createDepartment();
                break;
            case "Exit":
                console.log("Goodbye");
                connection.end();
        }
    });
}

function viewProductSales() {
    var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, " +
        "SUM(products.product_sales) AS product_sales, (SUM(products.product_sales) - departments.over_head_costs) AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name " +
        "GROUP BY department_name";
    connection.query(query, function(err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log("Department ID: " + res[i].department_id);
            console.log("Department Name: " + res[i].department_name);
            console.log("Over Head Costs: " + res[i].over_head_costs);
            console.log("Product Sales: " + res[i].product_sales);
            console.log("Total Profit: " + res[i].total_profit);
            console.log("----------------------------------");
        }
        showOptions();
    });
}

function createDepartment() {
    inquirer.prompt([{
        name: "department",
        type: "input",
        message: "What would you like the new department to be named?"
    }, {
        name: "over_head",
        type: "number",
        message: "What are the over head costs for this department?"
    }]).then(function(answer) {
        connection.query("INSERT INTO departments SET ?",
        {
            department_name: answer.department,
            over_head_costs: answer.over_head
        },
        function(err, res) {
            if (err) throw err;
            console.log("Department successfully created!");
            showOptions();
        });
    });
}