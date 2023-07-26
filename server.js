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
        )        .then(function (choice) {
            switch (choice.select) {
                case "View All Employees":
                    viewAllEmployees();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole()
                    break;
                case "View All Roles":
                    viewAllRoles();
                    break;
                case "Add a Role":
                    addRole();
                    break;
                case "View All Departments":
                    viewAllDepartments();
                    break;
                case "Add a Department":
                    addDepartment();
                    break;
                default:
                    quitProgram();
            }
        })
}

function viewAllEmployees() {
    const query = `SELECT
    emp.id AS employee_id,
    emp.first_name,
    emp.last_name,
    role.title,
    department.name AS department,
    role.salary,
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
FROM
    employee AS emp
LEFT JOIN
    role ON emp.role_id = role.id
LEFT JOIN
    department ON role.department_id = department.id
LEFT JOIN
    employee AS manager ON emp.manager_id = manager.id;

`;
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        employeeManagerPrompt();
    })
    
};

function addEmployee() {
    
};

function updateEmployeeRole() {

};
function viewAllRoles() {
    const query = `
        SELECT
            role.id AS role_id,
            role.title,
            role.salary,
            department.name AS department
        FROM
            role
        LEFT JOIN
            department ON role.department_id = department.id;
    `;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        employeeManagerPrompt();
    });
};
function addRole() {

};
function viewAllDepartments() {
    const query = `
        SELECT
            id AS department_id,
            name AS department
        FROM
            department;
    `;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        employeeManagerPrompt();
    });
};
function addDepartment() {

};

function quitProgram() {
    connection.end();
    process.exit();
  }

employeeManagerPrompt();



