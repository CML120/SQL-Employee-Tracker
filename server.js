// npm dependency / packages needed for this application
const inquirer = require('inquirer');
const mysql = require('mysql2');

// requiring env file for sensitive information
require("dotenv").config();

// dotenv variables
const dbUser = process.env.USER;
const dbPassword = process.env.PASSWORD;
const dbName = process.env.DATABASE;


const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: dbUser,
    password: dbPassword,
    database: dbName
})

function employeeManagerPrompt() {
    inquirer
        .prompt(
            {
                type: "list",
                name: "select",
                message: "What would you like to do?",
                choices: [
                    "View All Employees",
                    "Add Employee",
                    "Update Employee Role",
                    "View All Roles",
                    "Add a Role",
                    "View All Departments",
                    "Add a Department",
                    "Quit",
                ],
            },
        )
}




employeeManagerPrompt();



