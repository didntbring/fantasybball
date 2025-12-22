let statsData = {};

// Load the JSON data immediately when the page loads
async function init() {
    try {
        const response = await fetch('stats_db.json');
        statsData = await response.json();
        console.log("Stats Database Loaded");
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
}

function displayStats() {
    const name = document.getElementById('playerName').value;
    const resultsDiv = document.getElementById('results');
    const tableBody = document.getElementById('statsBody');
    
    // Check if player exists in your JSON
    if (statsData[name]) {
        resultsDiv.classList.remove('hidden');
        document.getElementById('displayName').innerText = name;
        tableBody.innerHTML = ''; // Clear old results

        // Get the first available season (or you can link this to the dropdown)
        const seasons = Object.keys(statsData[name]);
        const selectedSeason = seasons[0]; 

        const weeks = statsData[name][selectedSeason];

        for (const week in weeks) {
            const row = `<tr>
                <td>${week}</td>
                <td>${weeks[week].pts}</td>
                <td>${weeks[week].reb}</td>
                <td>${weeks[week].ast}</td>
                <td>${weeks[week].three_pt}</td>
                <td>${weeks[week].fan_pts}</td>
            </tr>`;
            tableBody.innerHTML += row;
        }
    } else {
        alert("Player not found. Make sure to use exact names like 'LeBron James'");
    }
}

init();
