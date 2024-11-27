const apiUrl = 'https://pokerhouse-checkin.onrender.com/api/users';
const apiUrlTables = 'https://pokerhouse-checkin.onrender.com/api/tables';
document.addEventListener('DOMContentLoaded', () => {
    const tableCapacities = { 1: 9, 2: 9, 3: 9, 4: 5 }; // Max seats per table
    const tablesContainer = document.getElementById('tablesContainer');

    const fetchTables = async () => {
        const response = await fetch(apiUrlTables);
        const tables = await response.json();
        console.log(tables);
        document.getElementById('xD').innerHTML = tables[0].name;
        document.getElementById('xDD').innerHTML = tables[1].name;
        document.getElementById('xDDD').innerHTML = tables[2].name;
        document.getElementById('xDDDD').innerHTML = tables[3].name;
    };


    // Fetch and display users
    const fetchUsers = async () => {
        const response = await fetch(apiUrl);
        const users = await response.json();
        displayUsers(users);
    };

    




    const displayUsers = (users) => {
        // Clear all table user lists and reset seat counts
        document.querySelectorAll('.user-list').forEach(list => list.innerHTML = '');
        document.querySelectorAll('.seat-count').forEach(count => count.textContent = '');

        // Group users by table
        const tableCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

        users.forEach(user => {
            const tableNumber = user.tableNumber;
            const tableDiv = document.getElementById(`table-${tableNumber}`).querySelector('.user-list');
            const userDiv = document.createElement('div');
            userDiv.classList.add('user');
            userDiv.innerHTML = `
                <span>${user.name}</span>
                <button class="delete-btn" onclick="removeUser(${user.id})">Odstrani</button>
            `;
            tableDiv.appendChild(userDiv);
            tableCounts[tableNumber]++;
        });

        // Update seat counts
        for (const tableNumber in tableCounts) {
            const seatCountDiv = document.getElementById(`table-${tableNumber}`).querySelector('.seat-count');
            const currentSeats = tableCounts[tableNumber];
            const maxSeats = tableCapacities[tableNumber];
            seatCountDiv.textContent = `Zasedeni sedeži: ${currentSeats} / ${maxSeats}`;
        }
    };

    // Sit at a specific table
    window.sitAtTable = async (tableNumber) => {
        const seatCountDiv = document.getElementById(`table-${tableNumber}`).querySelector('.seat-count');
        const currentSeats = parseInt(seatCountDiv.textContent.match(/\d+/)[0], 10);
        const maxSeats = tableCapacities[tableNumber];

        if (currentSeats >= maxSeats) {
            return alert(` ${tableNumber} je polna, prosim izberi drugo mizo`);
        }

        const name = prompt('Vnesi ime:');
        if (!name || name.trim() === '') {
            return alert('Vnesi ime.');
        }

        await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), tableNumber }),
        });

        fetchUsers();
    };

    // Remove a user
    window.removeUser = async (id) => {
        await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        fetchUsers();
    };

    fetchUsers();
    fetchTables();
});
