// 1. GLOBAL STATE - Load from localStorage if it exists
let myRoster = JSON.parse(localStorage.getItem('nbaRoster')) || {
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

    // Update UI for filled slots from memory
    for (const pos in myRoster) {
        if (myRoster[pos].name) {
            const slotDiv = document.getElementById(`slot-${pos}`);
            if (slotDiv) {
                slotDiv.classList.add('filled');
                slotDiv.querySelector('.player-info').innerText = `${myRoster[pos].name} (${myRoster[pos].season})`;
            }
        }
    }

    // REQ 1: If roster is filled, default to stats screen
    const hasPlayers = Object.values(myRoster).some(p => p.name !== '');
    if (hasPlayers) {
        goToStats();
    }
    
    console.log("App Initialized.");
}

async function preloadSeasonData() {
    const season = document.getElementById('seasonSelect').value;
    const datalist = document.getElementById('playerList');
    const nameInput = document.getElementById('playerName');
    datalist.innerHTML = '';
    nameInput.value = ''; 
    if (!season) return;
    try {
        const response = await fetch(`data/stats_${season}.json`);
        if (!response.ok) throw new Error(`Could not find data/stats_${season}.json`);
        const db = await response.json();
        Object.keys(db).sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });
    } catch (e) { console.error(e); }
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
        alert("Please select a SEASON first, then a PLAYER name!");
        return;
    }

    myRoster[position].name = name;
    myRoster[position].season = season;

    // Save to LocalStorage
    localStorage.setItem('nbaRoster', JSON.stringify(myRoster));

    const slotDiv = document.getElementById(`slot-${position}`);
    if (slotDiv) {
        slotDiv.classList.add('filled');
        slotDiv.querySelector('.player-info').innerText = `${name} (${season})`;
    }
}

// 5. FETCH & DISPLAY DATA
async function loadRosterData() {
    const tableBody = document.getElementById('statsBody');
    const weekSelect = document.getElementById('weekSelect');
    tableBody.innerHTML = '<tr><td colspan="8">Loading roster stats...</td></tr>';
    
    let allWeeks = new Set(); 

    for (const pos in myRoster) {
        const player = myRoster[pos];
        if (!player.name) continue;
        try {
            const response = await fetch(`data/stats_${player.season}.json`);
            const db = await response.json();
            if (db[player.name]) {
                player.data = db[player.name];
                Object.keys(player.data).forEach(w => allWeeks.add(w));
            }
        } catch (e) { console.error(e); }
    }

    // Update Week Dropdown
    weekSelect.innerHTML = '<option value="all">Show All Weeks</option>';
    const sortedWeeks = Array.from(allWeeks).sort((a, b) => {
        return parseInt(a.replace('week', '')) - parseInt(b.replace('week', ''));
    });
    sortedWeeks.forEach(w => weekSelect.add(new Option(w, w)));

    // REQ 3: "Remember" what week was selected
    const savedWeek = localStorage.getItem('selectedWeek') || 'all';
    weekSelect.value = savedWeek;
    renderTable(savedWeek);
}

function renderTable(filterWeek) {
    const tableBody = document.getElementById('statsBody');
    tableBody.innerHTML = '';
    let anyDataFound = false;

    // REQ 2: Totals tracking
    let totals = { pts: 0, reb: 0, ast: 0, tpm: 0, fan: 0 };

    for (const pos in myRoster) {
        const p = myRoster[pos];
        if (!p.data) continue;

        for (const week in p.data) {
            if (filterWeek !== 'all' && week !== filterWeek) continue;
            anyDataFound = true;
            const s = p.data[week];
            
            // Increment totals
            totals.pts += s.pts; totals.reb += s.reb; totals.ast += s.ast;
            totals.tpm += s.three_pt; totals.fan += s.fan_pts;

            tableBody.innerHTML += `
                <tr>
                    <td><strong>${pos}</strong></td>
                    <td>${p.name}</td>
                    <td>${week}</td>
                    <td>${s.pts}</td>
                    <td>${s.reb}</td>
                    <td>${s.ast}</td>
                    <td>${s.three_pt}</td>
                    <td class="fan-cell">${s.fan_pts.toFixed(1)}</td>
                </tr>`;
        }
    }

    // REQ 2: Add Sum Line
    if (anyDataFound) {
        tableBody.innerHTML += `
            <tr class="total-row">
                <td colspan="3">ROSTER TOTALS</td>
                <td>${totals.pts}</td>
                <td>${totals.reb}</td>
                <td>${totals.ast}</td>
                <td>${totals.tpm}</td>
                <td>${totals.fan.toFixed(1)}</td>
            </tr>`;
    } else {
        tableBody.innerHTML = '<tr><td colspan="8">No data found for this selection.</td></tr>';
    }
}

function filterTableByWeek() {
    const val = document.getElementById('weekSelect').value;
    localStorage.setItem('selectedWeek', val); // Remember week
    renderTable(val);
}

init();

