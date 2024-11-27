const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const http = require ('http');
const app = express();
const PORT = process.env.PORT || 3000;



// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Path to JSON file
const DATA_FILE = './data/users.json'; 
const TABLES_FILE = './data/tables.json';

// Helper function to read/write JSON file
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};
const readDataTables = () => {
    if (!fs.existsSync(TABLES_FILE)) return [];
    const data = fs.readFileSync(TABLES_FILE);
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const writeDataTables = (data) => {
    fs.writeFileSync(TABLES_FILE, JSON.stringify(data, null, 2));
};

// Generate unique ID
const generateId = () => {
    const users = readData();
    const ids = users.map(user => user.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
};

// API Routes

//get table names
app.get('/api/tables', (req, res) => {
    const tables = readDataTables(TABLES_FILE);
    res.json(tables);
});

// edit table name 
app.put('/api/tables/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    let tables = readDataTables(TABLES_FILE);
    const tableIndex = tables.findIndex(table => table.id === parseInt(id));

    if (tableIndex !== -1) {
        tables[tableIndex].name = name;
        writeDataTables(TABLES_FILE, tables);
        res.json({ message: 'Table name updated successfully', table: tables[tableIndex] });
    } else {
        res.status(404).json({ message: 'Table not found' });
    }
});

// Get current users
app.get('/api/users', (req, res) => {
    const users = readData();
    res.json(users);
});

// Add a new user
app.post('/api/users', (req, res) => {
    const { name, tableNumber } = req.body;
    const users = readData();
    const newUser = { id: generateId(), name, tableNumber };
    users.push(newUser);
    writeData(users);
    res.json({ message: 'User added successfully', user: newUser });
});

// Edit a user by ID
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { tableNumber } = req.body;
    let users = readData();
    const userIndex = users.findIndex(user => user.id === parseInt(id));

    if (userIndex !== -1) {
        users[userIndex].tableNumber = tableNumber;
        writeData(users);
        res.json({ message: 'User updated successfully', user: users[userIndex] });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Delete a user by ID
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    let users = readData();
    const newUsers = users.filter(user => user.id !== parseInt(id));

    if (newUsers.length !== users.length) {
        writeData(newUsers);
        res.json({ message: 'Uporabnik uspešno izbrisan' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
