// Sample Mini-Database: Real average weekly stats for specific seasons
const STATS_DB = {
    "LeBron James": {
        "2012": {
            "week1": { pts: 135, reb: 40, ast: 35, fgm: 52, three_pt: 8, gp: 5 },
            "week2": { pts: 120, reb: 38, ast: 30, fgm: 48, three_pt: 6, gp: 4 }
        },
        "2016": {
            "week1": { pts: 125, reb: 42, ast: 40, fgm: 45, three_pt: 10, gp: 5 }
        }
    },
    "Michael Jordan": {
        "1996": {
            "week1": { pts: 152, reb: 33, ast: 21, fgm: 58, three_pt: 5, gp: 5 },
            "week2": { pts: 140, reb: 30, ast: 25, fgm: 55, three_pt: 4, gp: 4 }
        }
    },
    "Shaquille O'Neal": {
        "2000": {
            "week1": { pts: 145, reb: 65, ast: 18, fgm: 60, three_pt: 0, gp: 5 }
        }
    }
};

let myTeam = [];

// Populate Dropdowns on Load
function init() {
    const players = Object.keys(STATS_DB);
    document.querySelectorAll('.slot').forEach(slot => {
        const pSelect = slot.querySelector('.player-select');
        players.forEach(p => {
            pSelect.innerHTML += `<option value="${p}">${p}</option>`;
        });
    });
}

function handleSelection(target, type) {
    const slot = target.closest('.slot');
    const pSelect = slot.querySelector('.player-select');
    const ySelect = slot.querySelector('.year-select');

    if (type === 'player' && pSelect.value) {
        const years = Object.keys(STATS_DB[pSelect.value]);
        ySelect.innerHTML = `<option value="">Select Year</option>`;
        years.forEach(y => {
            ySelect.innerHTML += `<option value="${y}">${y}</option>`;
        });
    }
}

function saveMyTeam() {
    myTeam = [];
    let complete = true;
    document.querySelectorAll('.slot').forEach(slot => {
        const name = slot.querySelector('.player-select').value;
        const year = slot.querySelector('.year-select').value;
        if (!name || !year) complete = false;
        myTeam.push({ pos: slot.dataset.pos, name, year });
    });

    if (!complete) {
        alert("Please fill all roster spots!");
        return;
    }
    alert("Roster Saved!");
    renderResults();
}

function calculateScore(s) {
    // Standard Fantasy Logic: PTS(1), REB(1.2), AST(1.5), 3PM(2)
    return (s.pts * 1) + (s.reb * 1.2) + (s.ast * 1.5) + (s.three_pt * 2);
}

function renderResults() {
    const week = "week" + document.getElementById('week-select').value;
    const statsContainer = document.getElementById('stats-container');
    const leaderboard = document.getElementById('leaderboard');

    let totalPoints = 0;
    let tableHtml = `<table><tr><th>POS</th><th>Player</th><th>Year</th><th>PTS</th><th>REB</th><th>AST</th><th>3PM</th><th>GP</th><th>FanPts</th></tr>`;

    myTeam.forEach(player => {
        const data = STATS_DB[player.name]?.[player.year]?.[week];
        if (data) {
            const fPts = calculateScore(data);
            totalPoints += fPts;
            tableHtml += `<tr>
                <td>${player.pos}</td>
                <td>${player.name}</td>
                <td>${player.year}</td>
                <td>${data.pts}</td>
                <td>${data.reb}</td>
                <td>${data.ast}</td>
                <td>${data.three_pt}</td>
                <td>${data.gp}</td>
                <td><strong>${fPts.toFixed(1)}</strong></td>
            </tr>`;
        } else {
            tableHtml += `<tr><td>${player.pos}</td><td colspan="8">No data for this selection/week</td></tr>`;
        }
    });

    tableHtml += `</table>`;
    leaderboard.innerHTML = `<div style="font-size: 24px; font-weight: bold; margin: 10px 0;">Total Score: ${totalPoints.toFixed(1)}</div>`;
    statsContainer.innerHTML = tableHtml;
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

init();
