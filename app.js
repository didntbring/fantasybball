// 1. GLOBAL STATE
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

// NEW: This pre-loads names for the autocomplete list based on chosen season
async function preloadSeasonData() {
    const season = document.getElementById('seasonSelect').value;
    const datalist = document.getElementById('playerList');
    const nameInput = document.getElementById('playerName');
    
    // Reset state
    datalist.innerHTML = '';
    nameInput.value = ''; 
    
    if (!season) return;

    try {
        console.log(`Fetching names for ${season}...`);
        const response = await fetch(`data/stats_${season}.json`);
        if (!response.ok) throw new Error(`Could not find data/stats_${season}.json`);
        
        const db = await response.json();
        const names = Object.keys(db).sort();

        // Populate the datalist for the search bar
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });
        
        console.log(`Success: ${names.length} players available for ${season}`);
    } catch (e) {
        console.error("Autocomplete load error:", e);
        alert("Could not load player list for this season. Check your /data folder.");
    }
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
            } else {
                player.data = null;
            }
        } catch (e) {
            console.error("Error loading roster data:", e);
        }
    }

    // Update Week Dropdown
    weekSelect.innerHTML = '<option value="all">Show All Weeks</option>';
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
        tableBody.innerHTML = '<tr><td colspan="8">No players assigned yet or no data found for selected week.</td></tr>';
    }
}

function filterTableByWeek() {
    const val = document.getElementById('weekSelect').value;
    renderTable(val);
}

// Initialize the season list
init();
