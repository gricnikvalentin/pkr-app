

const apiUrlUsers = 'https://pokerhouse-checkin.onrender.com/api/users';
const apiUrlTables = 'https://pokerhouse-checkin.onrender.com/api/tables';

//const apiUrlUsers = 'http://localhost:3000/api/users';
//const apiUrlTables = 'http://localhost:3000/api/tables';

document.addEventListener('DOMContentLoaded', () => {
    const tablesContainer = document.getElementById('tablesContainer');

    // Fetch and display tables with seats
    const fetchTables = async () => {
        const [tablesResponse, usersResponse] = await Promise.all([
            fetch(apiUrlTables),
            fetch(apiUrlUsers),
        ]);
        const tables = await tablesResponse.json();
        const users = await usersResponse.json();
        displayTables(tables, users);
    };

    const displayTables = (tables, users) => {
        tablesContainer.innerHTML = '';
        tables.forEach(table => {
            const tableDiv = document.createElement('div');
            tableDiv.classList.add('table');
            tableDiv.id = `table-${table.id}`;
            tableDiv.innerHTML = `
                <h1 >${table.name}</h1>
                <div class="seats">${generateSeats(table, users)}</div>
            `;


            const h1element = tableDiv.querySelector('h1');
            h1element.addEventListener('click', () => {
                renameTable(table.id, table.name);
            });
            tablesContainer.appendChild(tableDiv);
        });
    };


    const renameTable = async (id, currentName) => {
        const newName = prompt(`Enter a new name for the table "${currentName}":`, currentName);
        if (newName && newName.trim() !== '') {
            try {
                await fetch(`${apiUrlTables}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName.trim() }),
                });
                alert(`Table name updated to "${newName.trim()}"`);
                fetchTables(); // Refresh the tables
            } catch (error) {
                console.error('Error renaming table:', error);
                alert('Failed to update table name. Please try again.');
            }
        }
    };

    const generateSeats = (table, users) => {
        const seatsHTML = [];
        seatsHTML.push(`<button onclick="editTableSeats(${table.id})">Spremeni število sedežev</button>`);
        const tableUsers = users.filter(user => user.tableNumber === table.id);

        for (let i = 1; i <= table.seats; i++) {
            const user = tableUsers.find(user => user.seatNumber === i);
            seatsHTML.push(`
                <div class="seat">
                    <span style="margin-bottom:2pxx;margin-top:5px;"> Stol ${i} </span>
                    <div class="line-div"></div>
                    ${user ? `<h2>${user.name}</h2> <button onclick="deleteByID(${user.id})">Delete</button>` : ``}
                    ${!user ? `<button onclick="sitAtSeat(${table.id}, ${i})">sedi</button>` : ''}
                </div>
            `);
        }
        return seatsHTML.join('') + "";
    };



    window.editTableSeats = async (tableId) => {
        const newSeatCount = prompt(`Vnesi število sedežev za mizo ${tableId}:`);
    
        if (!newSeatCount || isNaN(newSeatCount) || parseInt(newSeatCount) <= 0) {
            return alert('Vnesi številko');
        }
    
        try {
            const response = await fetch(`${apiUrlTables}/${tableId}/seats`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seats: parseInt(newSeatCount) }),
            });
    
            if (response.ok) {
                alert(`Število sedežev pri mizi ${tableId} je bilo spremenjeno na ${newSeatCount}.`);
                fetchTables(); // Refresh the table data
            } else {
                const errorData = await response.json();
                alert(`Nekaj je šlo narobe: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Nekaj je šlo narobe:', error);
        }
    };


    // Sit at a specific seat
    window.sitAtSeat = async (tableNumber, seatNumber) => {
        const name = prompt('Vnesi ime:');
        if (!name || name.trim() === '') return alert('Ime nesme biti prazno.');
        try {
            await fetch(apiUrlUsers, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), tableNumber, seatNumber }),
            });
            fetchTables();
        } catch (error) {
            alert('Tu že nekdo sedi.');
        }
    };

    window.deleteByID = async (id) => {
        if (!confirm('Ste prepričani da hočete izbrisati uporabnika?')) return;
        try {
            const response = await fetch(`${apiUrlUsers}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Uporabnik uspešno izbrisan');
                fetchTables(); // Refresh tables after deletion
            } else {
                const errorData = await response.json();
                alert(`Uporabnika ni bilo mogoče izbrisat ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };
    fetchTables();
});
