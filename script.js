// 1. GLOBAL STATE - Now matches your 6-position HTML
let myRoster = {
    'PG': { name: '', season: '', data: null },
    'SG': { name: '', season: '', data: null },
    'SF': { name: '', season: '', data: null },
    'PF': { name: '', season: '', data: null },
    'C': { name: '', season: '', data: null },
    'UTIL': { name: '', season: '', data: null }
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
    console.log("App Initialized: Seasons loaded.");
}

// 3. SCREEN NAVIGATION
function goToStats() {
    document.getElementById('screen-roster').classList.add('hidden');
    document.getElementById('screen-stats').classList.remove('hidden');
    loadRosterData(); 
}

function goToRoster() {
    document.getElementById('screen-stats').classList.add('hidden');
    document.getElementById('screen-roster').classList.remove('hidden');
}

// 4. ASSIGN PLAYER TO SLOT
function assignToSlot(position) {
    const nameInput = document.getElementById('playerName');
    const seasonSelect = document.getElementById('seasonSelect');
    
    const name = nameInput.value.trim();
    const season = seasonSelect.value;

    if (!name || !season) {
        alert("Please enter a name and select a season first!");
        return;
    }

    // Save selection to our roster object
    myRoster[position].name = name;
    myRoster[position].season = season;

    // Update the UI
    const slotDiv = document.getElementById(`slot-${position}`);
    if (slotDiv) {
        slotDiv.classList.add('filled');
        slotDiv.querySelector('.player-info').innerText = `${name} (${season})`;
    }
    
    console.log(`Assigned ${name} (${season}) to ${position}`);
}

// 5. FETCH & DISPLAY DATA
async function loadRosterData() {
    const tableBody = document.getElementById('statsBody');
    const weekSelect = document.getElementById('weekSelect');
    tableBody.innerHTML = '<tr><td colspan="8">Loading stats from database...</td></tr>';
    
    let allWeeks = new Set(); 

    // Loop through each roster position
    for (const pos in myRoster) {
        const player = myRoster[pos];
        if (!player.name) continue;

        try {
            // Path to your /data folder
            const response = await fetch(`data/stats_${player.season}.json`);
            if (!response.ok) throw new Error(`File not found: stats_${player.season}.json`);
            
            const db = await response.json();
            
            // Check for exact name match (Case Sensitive!)
            if (db[player.name]) {
                player.data = db[player.name];
                Object.keys(player.data).forEach(w => allWeeks.add(w));
            } else {
                player.data = null;
                console.warn(`Player "${player.name}" not found in ${player.season} file.`);
            }
        } catch (e) {
            console.error("Fetch error:", e);
        }
    }

    // Update Week Dropdown
    weekSelect.innerHTML = '<option value="all">Show All Weeks</option>';
    // Sort weeks so week1 comes before week10
    const sortedWeeks = Array.from(allWeeks).sort((a, b) => {
        return parseInt(a.replace('week', '')) - parseInt(b.replace('week', ''));
    });

    sortedWeeks.forEach(w => {
        weekSelect.add(new Option(w, w));
    });

    renderTable('all');
}

function renderTable(filterWeek) {
    const tableBody = document.getElementById('statsBody');
    tableBody.innerHTML = '';

    let anyDataFound = false;

    for (const pos in myRoster) {
        const p = myRoster[pos];
        if (!p.data) continue;

        for (const week in p.data) {
            if (filterWeek !== 'all' && week !== filterWeek) continue;

            anyDataFound = true;
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
                    <td style="background:#f0f7ff; font-weight:bold; color:#007bff;">${s.fan_pts}</td>
                </tr>`;
        }
    }

    if (!anyDataFound) {
        tableBody.innerHTML = '<tr><td colspan="8">No data found. Check player names and folder path.</td></tr>';
    }
}

function filterTableByWeek() {
    const val = document.getElementById('weekSelect').value;
    renderTable(val);
}

// Start the app
init();
