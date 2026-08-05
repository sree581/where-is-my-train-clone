const API_BASE_URL = 'http://localhost:5000/api/trains';

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tabName === 'spot') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('spot-tab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('between-tab').classList.add('active');
    }
}

async function searchTrain() {
    const query = document.getElementById('trainQuery').value.trim();
    const resultsDiv = document.getElementById('spotResults');
    resultsDiv.innerHTML = '<p>Searching...</p>';

    if (!query) {
        resultsDiv.innerHTML = '<p class="error-message">Please enter a train number or name.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/spot/${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                resultsDiv.innerHTML = '<p class="error-message">Train not found in database.</p>';
                return;
            }
            throw new Error(`Server status: ${response.status}`);
        }

        const train = await response.json();
        renderTrainDetail(train, resultsDiv);
    } catch (err) {
        resultsDiv.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
    }
}

async function searchBetweenStations() {
    const from = document.getElementById('fromStation').value.trim();
    const to = document.getElementById('toStation').value.trim();
    const resultsDiv = document.getElementById('betweenResults');
    resultsDiv.innerHTML = '<p>Searching trains...</p>';

    if (!from || !to) {
        resultsDiv.innerHTML = '<p class="error-message">Please fill in both Station Codes.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const trains = await response.json();

        if (trains.length === 0) {
            resultsDiv.innerHTML = '<p class="error-message">No trains found connecting these stations.</p>';
            return;
        }

        let html = '';
        trains.forEach(train => {
            const runsOnText = Array.isArray(train.runsOn) ? train.runsOn.join(', ') : 'Daily';
            html += `
                <div class="card">
                    <h3>${train.trainNumber} - ${train.trainName}</h3>
                    <p><strong>Route:</strong> ${train.source} ➔ ${train.destination}</p>
                    <p><strong>Runs On:</strong> ${runsOnText}</p>
                </div>
            `;
        });
        resultsDiv.innerHTML = html;
    } catch (err) {
        resultsDiv.innerHTML = `<p class="error-message">Error connecting to server: ${err.message}</p>`;
    }
}

function renderTrainDetail(train, container) {
    const runsOnText = Array.isArray(train.runsOn) ? train.runsOn.join(', ') : 'Daily';
    
    // Checks both common property names to prevent 'undefined'
    const source = train.source || train.from || 'N/A';
    const destination = train.destination || train.to || 'N/A';

    let scheduleRows = (train.schedule || train.stationSchedule || []).map(s => `
        <tr>
            <td>${s.stationCode || s.code || 'N/A'}</td>
            <td>${s.stationName || s.name || 'N/A'}</td>
            <td>${s.arrivalTime || s.arr || 'N/A'}</td>
            <td>${s.departureTime || s.dep || 'N/A'}</td>
            <td>${s.platform || '1'}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="card">
            <h3>${train.trainNumber} - ${train.trainName}</h3>
            <p><strong>Source:</strong> ${source}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Runs On:</strong> ${runsOnText}</p>
            
            <h4 style="margin-top: 15px;">Route Schedule:</h4>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Station</th>
                        <th>Arr</th>
                        <th>Dep</th>
                        <th>Platform</th>
                    </tr>
                </thead>
                <tbody>
                    ${scheduleRows}
                </tbody>
            </table>
        </div>
    `;
}