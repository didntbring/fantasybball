// Mock Database (This replaces the real data for now)
const HISTORICAL_DATA = {
    "LeBron James": {
        "2012": {
            "week1": { pts: 110, reb: 30, ast: 25, fgm: 40, three_pt: 5 },
            "week2": { pts: 95, reb: 28, ast: 22, fgm: 35, three_pt: 4 }
        }
    },
    "Shaquille O'Neal": {
        "1996": {
            "week1": { pts: 120, reb: 50, ast: 10, fgm: 50, three_pt: 0 },
            "week2": { pts: 105, reb: 45, ast: 8, fgm: 42, three_pt: 0 }
        }
    }
};

let teams = [];

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

function saveTeams() {
    const u1Name = document.querySelector('#user1-entry .player-name').value;
    const u1Year = document.querySelector('#user1-entry .player-year').value;
    const u2Name = document.querySelector('#user2-entry .player-name').value;
    const u2Year = document.querySelector('#user2-entry .player-year').value;

    teams = [
        { user: "User 1", name: u1Name, year: u1Year },
        { user: "User 2", name: u2Name, year: u2Year }
    ];

    alert("Teams Saved! Go to View Results.");
    renderResults();
}

function calculateFantasyPoints(stats) {
    // Simple formula: Pts(1) + Reb(1.2) + Ast(1.5)
    return (stats.pts * 1) + (stats.reb * 1.2) + (stats.ast * 1.5);
}

function renderResults() {
    const week = "week" + document.getElementById('week-select').value;
    const leaderboard = document.getElementById('leaderboard');
    const statsContainer = document.getElementById('stats-container');

    let htmlTable = `<table><tr><th>User</th><th>Player</th><th>Fantasy Points</th></tr>`;
    let detailedStats = `<table><tr><th>User</th><th>PTS</th><th>REB</th><th>AST</th><th>FGM</th><th>3PT</th></tr>`;
    
    let scores = [];

    teams.forEach(team => {
        const playerData = HISTORICAL_DATA[team.name] ? HISTORICAL_DATA[team.name][team.year] : null;
        
        if (playerData && playerData[week]) {
            const stats = playerData[week];
            const fPts = calculateFantasyPoints(stats);
            scores.push({user: team.user, score: fPts});

            htmlTable += `<tr><td>${team.user}</td><td>${team.name} (${team.year})</td><td>${fPts.toFixed(1)}</td></tr>`;
            detailedStats += `<tr><td>${team.user}</td><td>${stats.pts}</td><td>${stats.reb}</td><td>${stats.ast}</td><td>${stats.fgm}</td><td>${stats.three_pt}</td></tr>`;
        } else {
            htmlTable += `<tr><td>${team.user}</td><td>No data found</td><td>0</td></tr>`;
        }
    });

    htmlTable += `</table>`;
    detailedStats += `</table>`;

    leaderboard.innerHTML = htmlTable;
    statsContainer.innerHTML = detailedStats;
}
