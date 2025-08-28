const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Fungsi baca file employees
function readEmployees() {
    const data = fs.readFileSync('employees_dummy.json');
    return JSON.parse(data).employees;
}

// Fungsi tulis file employees
function writeEmployees(employees) {
    fs.writeFileSync('employees_dummy.json', JSON.stringify({ employees }, null, 2));
}

// CREATE Employee
app.post("/api/employees", (req, res) => {
    const employees = readEmployees();
    const { username, firstName, lastName, email, birthDate, basicSalary, status, group } = req.body;

    // Validasi sederhana
    if (!username || !email) {
        return res.status(400).json({ message: "Username dan email wajib diisi" });
    }

    const newEmployee = {
        id: employees.length ? employees[employees.length - 1].id + 1 : 1,
        username,
        firstName,
        lastName,
        email,
        birthDate,
        basicSalary,
        status,
        group
    };

    employees.push(newEmployee);
    writeEmployees(employees);

    res.status(201).json(newEmployee);
});

// get employee with pagination + search + sort
app.get('/employees', (req, res) => {
    let employees = readEmployees();

    // pagination
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;

    // search
    const search = req.query.search ? req.query.search.toLowerCase() : null;
    if (search) {
        employees = employees.filter(emp =>
            emp.username.toLowerCase().includes(search) ||
            emp.firstName.toLowerCase().includes(search) ||
            emp.email.toLowerCase().includes(search)
        );
    }

    // filter by username
    if (req.query.username) {
        employees = employees.filter(emp => emp.username.toLowerCase() === req.query.username.toLowerCase());
    }

    // filter by status
    if (req.query.status) {
        employees = employees.filter(emp => emp.status.toLowerCase() === req.query.status.toLowerCase());
    }

    // filter by division
    if (req.query.group) {
        employees = employees.filter(emp => emp.group.toLowerCase() === req.query.group.toLowerCase());
    }

    // sorting
    const sortBy = req.query.sortBy || null; // contoh: 'username'
    const order = req.query.order === 'desc' ? 'desc' : 'asc'; // default asc

    if (sortBy) {
        employees.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // pagination slice
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginated = employees.slice(start, end);

    res.json({
        page,
        perPage,
        total: employees.length,
        data: paginated,
    });
});

// GET employees dengan filter & search TANPA pagination
app.get('/employees/filter', (req, res) => {
    let employees = readEmployees();

    // search
    const search = req.query.search ? req.query.search.toLowerCase() : null;
    if (search) {
        employees = employees.filter(emp =>
            emp.username.toLowerCase().includes(search) ||
            emp.firstName.toLowerCase().includes(search) ||
            emp.email.toLowerCase().includes(search)
        );
    }

    // filter by username
    if (req.query.username) {
        employees = employees.filter(emp => emp.username.toLowerCase() === req.query.username.toLowerCase());
    }

    // filter by status
    if (req.query.status) {
        employees = employees.filter(emp => emp.status.toLowerCase() === req.query.status.toLowerCase());
    }

    // filter by group/division
    if (req.query.group) {
        employees = employees.filter(emp => emp.group.toLowerCase() === req.query.group.toLowerCase());
    }

    // sorting (optional)
    const sortBy = req.query.sortBy || null; // contoh: 'username'
    const order = req.query.order === 'desc' ? 'desc' : 'asc';

    if (sortBy) {
        employees.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    res.json({
        total: employees.length,
        data: employees
    });
});


// GET by ID
app.get("/api/employees/:id", (req, res) => {
    let employees = readEmployees();
    const id = parseInt(req.params.id, 10);
    const employee = employees.find((emp) => emp.id === id);

    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
});

// DELETE by ID
app.delete('/api/employees/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    let employees = readEmployees();
    const index = employees.findIndex((emp) => emp.id === id);

    if (index === -1) return res.status(404).json({ message: 'Employee not found' });

    employees.splice(index, 1); // hapus
    writeEmployees(employees);

    res.json({ message: 'Employee deleted successfully' });
});

// UPDATE by ID
app.put('/api/employees/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    let employees = readEmployees();
    const index = employees.findIndex((emp) => emp.id === id);

    if (index === -1) return res.status(404).json({ message: 'Employee not found' });

    employees[index] = { ...employees[index], ...req.body };
    writeEmployees(employees);

    res.json({ message: 'Employee updated successfully', employee: employees[index] });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
