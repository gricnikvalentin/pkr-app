//const apiUrlUsers = 'http://localhost:3000/api/users';
//const apiUrlTables = 'http://localhost:3000/api/tables';

const apiUrlUsers = 'https://pokerhouse-checkin.onrender.com/api/users';
const apiUrlTables = 'https://pokerhouse-checkin.onrender.com/api/tables';

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
                <h1>${table.name}</h1>
                <div class="seats">${generateSeats(table, users)}</div>
            `;
            tablesContainer.appendChild(tableDiv);
        });
    };

    const generateSeats = (table, users) => {
        const seatsHTML = [];
        const tableUsers = users.filter(user => user.tableNumber === table.id);

        for (let i = 1; i <= table.seats; i++) {
            const user = tableUsers.find(user => user.seatNumber === i);
            seatsHTML.push(`
                <div class="seat">
                    <span class="seat-num"> Stol ${i} </span>
                    ${user ? `<span class="seat-user">${user.name}</h3>` : ``}
                    ${!user ? `<button onclick="sitAtSeat(${table.id}, ${i})">sedi</button>` : ''}
                </div>
            `);
        }
        return seatsHTML.join('');
    };



    // Sit at a specific seat
    window.sitAtSeat = async (tableNumber, seatNumber) => {
        const name = prompt('Enter your name:');
        if (!name || name.trim() === '') return alert('Name cannot be empty.');
        try {
            await fetch(apiUrlUsers, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), tableNumber, seatNumber }),
            });
            fetchTables();
        } catch (error) {
            alert('Could not sit at this seat. It may already be taken.');
        }
    };

    fetchTables();
});
