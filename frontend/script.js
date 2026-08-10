const API_BASE_URL = 'http://localhost:5000/api/trains';

function changeTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

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
    if (!query) return;
    fetchAndRenderRoute(query);
}

// Added searchBetweenStations to clear the Uncaught ReferenceError
async function searchBetweenStations() {
    const from = document.getElementById('fromStation').value.trim();
    const to = document.getElementById('toStation').value.trim();
    const trackingContainer = document.getElementById('trackingContainer');

    if (!from || !to) {
        alert("Please enter both source and destination stations.");
        return;
    }

    trackingContainer.classList.remove('hidden');
    trackingContainer.innerHTML = `<p style="padding:15px; text-align:center; color:#1565c0;">Searching trains from ${from.toUpperCase()} to ${to.toUpperCase()}...</p>`;

    try {
        const response = await fetch(`${API_BASE_URL}/between/${encodeURIComponent(from)}/${encodeURIComponent(to)}`);
        
        if (!response.ok) {
            trackingContainer.innerHTML = `<p style="padding:15px; color:red; text-align:center;">No trains found for this route.</p>`;
            return;
        }

        const trains = await response.json();

        if (!trains || trains.length === 0) {
            trackingContainer.innerHTML = `<p style="padding:15px; text-align:center;">No trains available between ${from.toUpperCase()} and ${to.toUpperCase()}.</p>`;
            return;
        }

        let trainsHTML = trains.map(t => `
            <div class="train-card-item" onclick="fetchAndRenderRoute('${t.trainNumber}')" style="padding: 12px; border-bottom: 1px solid #334155; cursor: pointer;">
                <div style="font-weight: bold; font-size: 1rem;">${t.trainNumber} - ${t.trainName}</div>
                <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px; display: flex; justify-content: space-between;">
                    <span>Dep: ${t.departureTime}</span>
                    <span>Arr: ${t.arrivalTime}</span>
                    <span>Duration: ${t.travelTime}</span>
                </div>
            </div>
        `).join('');

        trackingContainer.innerHTML = `
            <div style="background: #1e293b; color: white; padding: 10px 15px; font-weight: bold;">
                Trains: ${from.toUpperCase()} ➔ ${to.toUpperCase()} (${trains.length})
            </div>
            <div class="train-list-results">
                ${trainsHTML}
            </div>
        `;
    } catch (err) {
        trackingContainer.innerHTML = `<p style="padding:15px; color:red; text-align:center;">Error: ${err.message}</p>`;
    }
}

async function fetchAndRenderRoute(query) {
    const trackingContainer = document.getElementById('trackingContainer');
    trackingContainer.classList.remove('hidden');
    trackingContainer.innerHTML = '<p style="padding:15px; text-align:center;">Loading route timeline...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/spot/${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            trackingContainer.innerHTML = '<p style="padding:15px; color:red; text-align:center;">Train schedule unavailable.</p>';
            return;
        }

        const train = await response.json();
        renderTrackingView(train);
    } catch (err) {
        trackingContainer.innerHTML = `<p style="padding:15px; color:red; text-align:center;">Error: ${err.message}</p>`;
    }
}

function renderTrackingView(train) {
    const container = document.getElementById('trackingContainer');
    const schedule = train.schedule || [];

    if (schedule.length === 0) {
        container.innerHTML = `<p style="padding:15px; color:red; text-align:center;">No route data found.</p>`;
        return;
    }

    let currentStationIndex = schedule.length > 2 ? schedule.length - 2 : 0; 

    let nodesHTML = schedule.map((st, index) => {
        return `
            <div class="station-node" id="node-${index}">
                <!-- Scheduled & Actual Arrival -->
                <div class="time-col arr-col">
                    <div class="sch-time">${st.arrivalTime || '--'}</div>
                    <div class="act-time">${st.arrivalTime !== 'START' ? st.arrivalTime : ''}</div>
                </div>

                <!-- Center Route Line Dot -->
                <div class="node-icon-area">
                    <div class="node-dot"></div>
                </div>

                <!-- Station Info & Platform -->
                <div class="station-details">
                    <div class="station-name">${st.stationName}</div>
                    <div class="station-meta">
                        <span>${(index + 1) * 15} km</span>
                        <span class="platform-badge">Platform ${st.platform} ✏️</span>
                    </div>
                </div>

                <!-- Scheduled & Actual Departure -->
                <div class="time-col dep-col">
                    <div class="sch-time">${st.departureTime || '--'}</div>
                    <div class="act-time">${st.departureTime !== 'END' ? st.departureTime : ''}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="train-card-header">
            <div class="train-title">← ${train.trainNumber} - ${train.trainName} (${train.source}-${train.destination})</div>
            <div class="top-bar-actions">
                <button class="chip-btn">Yesterday ▾</button>
                <button class="chip-btn">⏰ Alarm</button>
                <button class="chip-btn">🚃 Coach</button>
                <button class="chip-btn">🔗 Share</button>
            </div>
        </div>

        <div class="route-day-header">
            Day 2 - Today
        </div>

        <div class="route-timeline-wrapper">
            <!-- Continuous Blue Track Line -->
            <div class="timeline-vertical-line"></div>
            
            <!-- Live Train Icon Badge -->
            <div id="liveTrainMarker" class="live-train-marker">
                🚆
            </div>

            ${nodesHTML}
        </div>

        <div class="bottom-status-card">
            Arrived ${train.destination}
            <div style="font-size:0.75rem; opacity:0.8; margin-top:2px;">Updated 5 mins ago</div>
        </div>
    `;

    // Position train icon on target station
    setTimeout(() => {
        const targetNode = document.getElementById(`node-${currentStationIndex}`);
        if (targetNode) {
            const topPos = targetNode.offsetTop + 12;
            document.getElementById('liveTrainMarker').style.top = `${topPos}px`;
        }
    }, 100);
}