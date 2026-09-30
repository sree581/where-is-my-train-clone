const trackingForm = document.getElementById('tracking-form');

const trainNumberInput = document.getElementById('train-number');

const loadingMessage = document.getElementById('loading');

const errorMessage = document.getElementById('error-message');

const trainResult = document.getElementById('train-result');

const trainName = document.getElementById('train-name');

const trainNumberDisplay = document.getElementById('train-number-display');

const trainStatus = document.getElementById('train-status');

const sourceStation = document.getElementById('source-station');

const destinationStation = document.getElementById('destination-station');

const currentLocation = document.getElementById('current-location');

const delay = document.getElementById('delay');

const scheduleContainer = document.getElementById('schedule-container');


trackingForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const trainNumber = trainNumberInput.value.trim();

    if (!trainNumber) {
        showError('Please enter a train number.');
        return;
    }

    // Reset previous messages/results
    errorMessage.classList.add('hidden');
    trainResult.classList.add('hidden');
    loadingMessage.classList.remove('hidden');

    try {

        const response = await fetch(
            `http://localhost:5000/api/trains/spot/${encodeURIComponent(trainNumber)}`
        );

        if (!response.ok) {
            throw new Error('Unable to fetch train status.');
        }

        const data = await response.json();

        displayTrainStatus(data, trainNumber);

    } catch (error) {

        console.error('Tracking error:', error);

        showError(
            'Failed to fetch train details. Please make sure the backend server is running.'
        );

    } finally {

        loadingMessage.classList.add('hidden');

    }

});


function displayTrainStatus(data, searchedTrainNumber) {

    trainResult.classList.remove('hidden');

    trainNumberDisplay.textContent =
        data.trainNumber || searchedTrainNumber;

    trainName.textContent =
        data.trainName || 'Train Name Not Available';

    trainStatus.textContent =
        data.positionStatus ||
        data.status ||
        'Status not available';

    sourceStation.textContent =
        data.source || 'N/A';

    destinationStation.textContent =
        data.destination || 'N/A';

    currentLocation.textContent =
        data.currentStation ||
        data.currentLocation ||
        'Information not available';

    const delayMinutes = data.delayMinutes;

    if (delayMinutes !== undefined && delayMinutes !== null) {

        delay.textContent =
            delayMinutes === 0
                ? 'On Time'
                : `${delayMinutes} minutes late`;

    } else {

        delay.textContent = 'N/A';

    }

    displaySchedule(data.schedule || []);

}


function displaySchedule(schedule) {

    scheduleContainer.innerHTML = '';

    if (!Array.isArray(schedule) || schedule.length === 0) {

        scheduleContainer.innerHTML =
            '<p>No journey schedule available.</p>';

        return;
    }

    // Header row
    const header = document.createElement('div');

    header.className = 'station-row';

    header.innerHTML = `
        <strong>Station</strong>
        <strong>Arrival</strong>
        <strong>Departure</strong>
        <strong>Platform</strong>
    `;

    scheduleContainer.appendChild(header);


    schedule.forEach((station) => {

        const row = document.createElement('div');

        row.className = 'station-row';

        const stationName =
            station.stationName ||
            station.station ||
            'Unknown Station';

        const arrivalTime =
            station.arrivalTime ||
            station.arr ||
            '-';

        const departureTime =
            station.departureTime ||
            station.dep ||
            '-';

        const platform =
            station.platform ||
            '-';

        row.innerHTML = `
            <div class="station-name">
                ${stationName}
            </div>

            <div class="station-time">
                ${arrivalTime}
            </div>

            <div class="station-time">
                ${departureTime}
            </div>

            <div class="station-status">
                Platform ${platform}
            </div>
        `;

        scheduleContainer.appendChild(row);

    });

}


function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove('hidden');

    trainResult.classList.add('hidden');

}