const API_BASE_URL = "http://localhost:5000";
const searchButton = document.querySelector(".search-button");
const stationInputs = document.querySelectorAll(".station-input input");
const fromInput = stationInputs[0];
const toInput = stationInputs[1];

searchButton.addEventListener("click", async () => {
    const fromText = fromInput.value;
    const toText = toInput.value;

    const fromMatch = fromText.match(/\(([^)]+)\)/);
    const toMatch = toText.match(/\(([^)]+)\)/);

    if (!fromMatch || !toMatch) {
        alert("Please select valid stations.");
        return;
    }

    const fromCode = fromMatch[1];
    const toCode = toMatch[1];

    try {
        searchButton.disabled = true;
        searchButton.textContent = "Searching...";

        const response = await fetch(
            `${API_BASE_URL}/api/trains/between/${fromCode}/${toCode}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch trains");
        }

        const trains = await response.json();

        console.log("Trains received from backend:", trains);

        displayTrains(trains, fromCode, toCode);

    } catch (error) {
        console.error("Train search error:", error);
        alert("Unable to fetch trains. Please make sure the backend is running.");
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "🔍 Search";
    }
});


function displayTrains(trains, fromCode, toCode) {
    const trainList = document.querySelector(".train-list");

    if (!trainList) {
        console.error("Train list container not found.");
        return;
    }

    trainList.innerHTML = "";

    if (!trains || trains.length === 0) {
        trainList.innerHTML = "<p>No trains found for this route.</p>";
        return;
    }

    trains.forEach(train => {
        const card = document.createElement("div");
        card.className = "train-card";

        card.innerHTML = `
            <div class="train-header">
                <div class="train-title">
                    <span class="train-number">${train.trainNumber}</span>
                    <span class="train-name">${train.trainName}</span>
                </div>
            </div>

            <div class="route">
                ${fromInput.value.match(/\(([^)]+)\)/)[1]}
                → 
                ${toInput.value.match(/\(([^)]+)\)/)[1]}
            </div>

            <div class="train-timing">
                <div class="time departure">
                    <div class="time-value">${train.departureTime}</div>
                    <div class="station-code">${fromCode}</div>
                </div>

                <div class="route-line">
                    <span class="line"></span>
                </div>

                <div class="time arrival">
                    <div class="time-value">${train.arrivalTime}</div>
                    <div class="station-code">${toCode}</div>
                </div>
            </div>

            <div class="train-footer">
                <span class="running-days">📅</span>
                <span class="coach">${train.travelTime}</span>
            </div>
        `;

        trainList.appendChild(card);
    });
}