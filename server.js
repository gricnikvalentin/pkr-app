const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require ('path')
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));


app.get('/admin' ,(req,res)=>{
    res.sendFile(path.join(__dirname, 'public/admin/index_admin.html'));
})
app.get('/' ,(req,res)=>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
})


/// Path to JSON files
const USERS_FILE = './data/users.json';
const TABLES_FILE = './data/tables.json';

// Helper functions to read/write JSON files
const readData = (file) => {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file);
    return JSON.parse(data);
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

app.put('/api/tables/:id/seats', (req, res) => {
    const { id } = req.params;
    const { seats } = req.body;

    if (!seats || isNaN(seats) || parseInt(seats) <= 0) {
        return res.status(400).json({ message: 'Invalid number of seats provided.' });
    }

    const tables = readData(TABLES_FILE);
    const tableIndex = tables.findIndex(table => table.id === parseInt(id));

    if (tableIndex === -1) {
        return res.status(404).json({ message: 'Table not found.' });
    }

    // Update the seats property
    tables[tableIndex].seats = parseInt(seats);

    // Save the updated data back to the file
    writeData(TABLES_FILE, tables);
    res.json({ message: 'Table seats updated successfully.', table: tables[tableIndex] });
});




// API: Get users
app.get('/api/users', (req, res) => {
    const users = readData(USERS_FILE);
    res.json(users);
});

// API: Add a user to a specific seat
app.post('/api/users', (req, res) => {
    const { name, tableNumber, seatNumber } = req.body;
    const users = readData(USERS_FILE);

    // Check if the seat is already taken
    const seatTaken = users.some(user => user.tableNumber === tableNumber && user.seatNumber === seatNumber);
    if (seatTaken) {
        return res.status(400).json({ message: 'Seat already taken' });
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        tableNumber,
        seatNumber
    };
    users.push(newUser);
    writeData(USERS_FILE, users);
    res.json({ message: 'User added successfully', user: newUser });
});

app.put('/api/tables/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    let tables = readData(TABLES_FILE);
    const tableIndex = tables.findIndex(table => table.id === parseInt(id));

    if (tableIndex !== -1) {
        tables[tableIndex].name = name;
        writeData(TABLES_FILE, tables);
        res.json({ message: 'Table name updated successfully', table: tables[tableIndex] });
    } else {
        res.status(404).json({ message: 'Table not found' });
    }
});

// API: Remove a user by ID
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const usersData = fs.existsSync(USERS_FILE) ? fs.readFileSync(USERS_FILE) : '[]';
    let users = JSON.parse(usersData);

    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ message: 'User deleted successfully' });
});

// API: Get table names
app.get('/api/tables', (req, res) => {
    const tables = readData(TABLES_FILE);
    res.json(tables);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});