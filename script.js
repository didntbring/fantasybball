// 1. GLOBAL STATE
let myRoster = {
    'G': { name: '', season: '', data: null },
    'F': { name: '', season: '', data: null },
    'C': { name: '', season: '', data: null }
};

// 2. INITIALIZE PAGE
function init() {
    const select = document.getElementById('seasonSelect');
    // Generate seasons from 2024 back to 1946
    for (let i = 2024; i >= 1946; i--) {
        let yearShort = String(i + 1).slice(-2);
        let seasonValue = `${i}-${yearShort}`;
        let option = new Option(seasonValue, seasonValue);
        select.add(option);
    }
}

// 3. SCREEN NAVIGATION
function goToStats() {
    document.getElementById('screen-roster').classList.add('hidden');
    document.getElementById('screen-stats').classList.remove('hidden');
    loadRosterData(); // Fetch the JSONs for all selected players
}

function goToRoster() {
    document.getElementById('screen-stats').classList.add('hidden');
    document.getElementById('screen-roster').classList.remove('hidden');
}

// 4. ASSIGN PLAYER TO SLOT
function assignToSlot(position) {
    const name = document.getElementById('playerName').value.trim();
    const season = document.getElementById('seasonSelect').value;

    if (!name || !season) {
        alert("Please enter a name and select a season!");
        return;
    }

    // Save selection to our roster object
    myRoster[position].name = name;
    myRoster[position].season = season;

    // Update the UI
    const slotDiv = document.getElementById(`slot-${position}`);
    slotDiv.classList.add('filled');
    slotDiv.querySelector('.player-info').innerText = `${name} (${season})`;
}

// 5. FETCH & DISPLAY DATA
async function loadRosterData() {
    const tableBody = document.getElementById('statsBody');
    const weekSelect = document.getElementById('weekSelect');
    tableBody.innerHTML = '<tr><td colspan="8">Loading stats...</td></tr>';
    
    let allWeeks = new Set(); // To fill the week dropdown

    // Loop through each roster position
    for (const pos in myRoster) {
        const player = myRoster[pos];
        if (!player.name) continue;

        try {
            // Fetch the specific season file from the /data/ folder
            const response = await fetch(`data/stats_${player.season}.json`);
            const db = await response.json();
            
            if (db[player.name]) {
                player.data = db[player.name];
                Object.keys(player.data).forEach(w => allWeeks.add(w));
            } else {
                player.data = null;
                console.warn(`${player.name} not found in ${player.season}`);
            }
        } catch (e) {
            console.error("Fetch error:", e);
        }
    }

    // Update Week Dropdown
    weekSelect.innerHTML = '<option value="all">Show All Weeks</option>';
    Array.from(allWeeks).sort().forEach(w => {
        weekSelect.add(new Option(w, w));
    });

    renderTable('all');
}

function renderTable(filterWeek) {
    const tableBody = document.getElementById('statsBody');
    tableBody.innerHTML = '';

    for (const pos in myRoster) {
        const p = myRoster[pos];
        if (!p.data) continue;

        for (const week in p.data) {
            if (filterWeek !== 'all' && week !== filterWeek) continue;

            const s = p.data[week];
            tableBody.innerHTML += `
                <tr>
                    <td><strong>${pos}</strong></td>
                    <td>${p.name}</td>
                    <td>${week}</td>
                    <td>${s.pts}</td>
                    <td>${s.reb}</td>
                    <td>${s.ast}</td>
                    <td>${s.three_pt}</td>
                    <td style="background:#f0f7ff"><strong>${s.fan_pts}</strong></td>
                </tr>`;
        }
    }
}

function filterTableByWeek() {
    const val = document.getElementById('weekSelect').value;
    renderTable(val);
}

init();
