// npm dependency / packages needed for this application
const inquirer = require('inquirer');
const mysql = require('mysql2');

// requiring env file for sensitive information
require("dotenv").config();

// dotenv variables
const dbUser = process.env.USER;
const dbPassword = process.env.PASSWORD;
const dbName = process.env.DATABASE;

//Create connection to MySQL database
const connection = mysql.createConnection({
    host: "localhost",      //host name where server is running
    port: 3306,             //port number where the database server is listening, default 3306 for MySQL
    user: dbUser,           //username from dotenv file
    password: dbPassword,   //password from dotenv file
    database: dbName        //database name from dotenv file
})


//Main prompt for application's choices and functions
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
            })
        //switch case based on selected options, which will run the associated function
        .then(function (choice) {
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

//view all employee information, displaying employee ID, first name, last name, role, department, salary, and manager if applicable.
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

//add a new employee with first and last name, assigns a role, and a manager if applicable
function addEmployee() {
    const rolesQuery = "SELECT id, title FROM role";
    const managersQuery = "SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL";

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(rolesQuery, (err, roles) => {
                if (err) reject(err);
                else resolve(roles);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(managersQuery, (err, managers) => {
                if (err) reject(err);
                else resolve(managers);
            });
        }),
    ])
        .then(([roles, managers]) => {
            const roleChoices = roles.map((role) => ({
                name: role.title,
                value: role.id,
            }));
            const managerChoices = managers.map((manager) => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id,
            }));

            inquirer
                .prompt([
                    {
                        type: "input",
                        name: "first_name",
                        message: "What is the employee's first name:",
                    },
                    {
                        type: "input",
                        name: "last_name",
                        message: "What is the employee's last name:",
                    },
                    {
                        type: "list",
                        name: "role_id",
                        message: "Select the role for this employee:",
                        choices: roleChoices,
                    },
                    {
                        type: "list",
                        name: "manager_id",
                        message: "Select the manager for this employee (leave blank if none):",
                        choices: [{ name: "None", value: null }, ...managerChoices],
                    },
                ])
                .then((answers) => {
                    const { first_name, last_name, role_id, manager_id } = answers;
                    const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                    connection.query(query, [first_name, last_name, role_id, manager_id], (err, res) => {
                        if (err) throw err;
                        console.log(`${res.affectedRows} employee added!\n`);
                        employeeManagerPrompt();
                    });
                });
        })
        .catch((err) => {
            console.error("Error fetching data from the database:", err);
            employeeManagerPrompt();
        });
}

//select an employee and update their role
function updateEmployeeRole() {
    const employeesQuery = `
        SELECT 
            id,
            CONCAT(first_name, ' ', last_name) AS employee_name
        FROM 
            employee
    `;

    const rolesQuery = `
        SELECT 
            id,
            title
        FROM 
            role
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(employeesQuery, (err, employees) => {
                if (err) reject(err);
                else resolve(employees);
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(rolesQuery, (err, roles) => {
                if (err) reject(err);
                else resolve(roles);
            });
        }),
    ])
        .then(([employees, roles]) => {
            const employeeChoices = employees.map((employee) => ({
                name: employee.employee_name,
                value: employee.id,
            }));

            const roleChoices = roles.map((role) => ({
                name: role.title,
                value: role.id,
            }));

            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee_id",
                        message: "Select the employee to update:",
                        choices: employeeChoices,
                    },
                    {
                        type: "list",
                        name: "new_role_id",
                        message: "Select the new role for the employee:",
                        choices: roleChoices,
                    },
                ])
                .then((answers) => {
                    const { employee_id, new_role_id } = answers;
                    const query = "UPDATE employee SET role_id = ? WHERE id = ?";
                    connection.query(query, [new_role_id, employee_id], (err, res) => {
                        if (err) throw err;
                        console.log(`${res.affectedRows} employee role updated!\n`);
                        employeeManagerPrompt();
                    });
                });
        })
        .catch((err) => {
            console.error("Error fetching data from the database:", err);
            employeeManagerPrompt();
        });
}


//view all the current roles
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


//adds a new role (title and salary), then a department associated with the role, or if the department doesn't exist, adds a new department as well
function addRole() {
    const departmentsQuery = "SELECT id, name FROM department";

    connection.query(departmentsQuery, (err, departments) => {
        if (err) throw err;
        const departmentChoices = departments.map((department) => ({
            name: department.name,
            value: department.id,
        }));

        inquirer
            .prompt([
                {
                    type: "input",
                    name: "role_title",
                    message: "Enter the title of the new role:",
                },
                {
                    type: "input",
                    name: "role_salary",
                    message: "Enter the salary for the new role:",
                    validate: function (input) {
                        const salary = parseFloat(input);
                        if (isNaN(salary) || salary <= 0) {
                            return "Please enter a valid (numeric) salary greater than 0.";
                        }
                        return true;
                    },
                },
                {
                    type: "list",
                    name: "department_id",
                    message: "Select the department for the new role:",
                    choices: departmentChoices,
                },
            ])
            .then((answers) => {
                const { role_title, role_salary, department_id } = answers;
                const query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
                connection.query(query, [role_title, role_salary, department_id], (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} role added!\n`);
                    employeeManagerPrompt();
                });
            });
    });
}

// view all current departments
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

//adds a new department
function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "department_name",
                message: "Enter the name of the new department:",
            },
        ])
        .then((answers) => {
            const { department_name } = answers;
            const query = "INSERT INTO department (name) VALUES (?)";
            connection.query(query, [department_name], (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} department added!\n`);
                employeeManagerPrompt();
            });
        });
};

//ends the connection and exits the program
function quitProgram() {
    connection.end();
    process.exit();
}


//Initial start with a basic logo
function init() {
    console.log(`
                                       
 _____           _                 
 |   __|_____ ___| |___ _ _ ___ ___ 
 |   __|     | . | | . | | | -_| -_|
 |_____|_|_|_|  _|_|___|_  |___|___|
             |_|       |___|
                               
             _____             _           
             |_   _|___ ___ ___| |_ ___ ___ 
               | | |  _| .'|  _| '_| -_|  _|
               |_| |_| |__,|___|_,_|___|_|
             
             
`);

    employeeManagerPrompt();
}

init();

