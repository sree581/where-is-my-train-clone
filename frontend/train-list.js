document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = "http://localhost:5000";

    // Station dataset used for autocomplete (frontend-only for now)
    const STATIONS = [
        { name: "Kollam Jn", code: "QLN" },
        { name: "Ernakulam Jn", code: "ERS" },
        { name: "Thiruvananthapuram Central", code: "TVC" },
        { name: "Ernakulam Town", code: "ERN" },
        { name: "Alappuzha", code: "ALLP" },
        { name: "Kottayam", code: "KTYM" },
        { name: "Thrissur", code: "TCR" },
        { name: "Kozhikode", code: "CLT" },
        { name: "Kannur", code: "CAN" },
        { name: "Mangaluru Central", code: "MAQ" },
        { name: "Palakkad Jn", code: "PGT" },
        { name: "Shoranur Jn", code: "SRR" }
    ];

    // Elements
    const fromInput = document.getElementById("fromInput");
    const toInput = document.getElementById("toInput");

    const fromSuggestions = document.getElementById("fromSuggestions");
    const toSuggestions = document.getElementById("toSuggestions");

    const searchButton = document.querySelector(".search-button");
    const swapButton = document.querySelector(".swap-button");

    const clearButtons = document.querySelectorAll(".clear");

    const trainList = document.querySelector(".train-list");

    const tabs = document.querySelectorAll(".tab");

    const languageButton = document.querySelector(".language-btn");

    const plannerClose = document.querySelector(".planner-close");
    const journeyPlanner = document.querySelector(".journey-planner");


    // =====================================================
    // STATION AUTOCOMPLETE
    // =====================================================

    // Turns a typed value into a known station code, or null if invalid.
    // Accepts "Station Name (CODE)", a bare code like "QLN", or a full name.
    function resolveStationCode(value) {

        const trimmed = value.trim();

        if (!trimmed) {
            return null;
        }

        const bracketMatch = trimmed.match(/\(([A-Za-z]{2,5})\)\s*$/);

        if (bracketMatch) {
            return bracketMatch[1].toUpperCase();
        }

        const byName = STATIONS.find(
            station => station.name.toLowerCase() === trimmed.toLowerCase()
        );

        if (byName) {
            return byName.code;
        }

        // Any other station code (e.g. NDLS from the Home page) is passed to the backend as-is
        return /^[A-Za-z]{2,5}$/.test(trimmed) ? trimmed.toUpperCase() : null;
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function stationLabel(code) {
        const known = STATIONS.find(station => station.code === code);
        return known ? `${known.name} (${known.code})` : code;
    }

    function hideSuggestions(suggestionsBox) {
        suggestionsBox.classList.remove("active");
        suggestionsBox.innerHTML = "";
    }

    function showSuggestions(inputEl, suggestionsBox) {

        const query = inputEl.value.trim().toLowerCase();

        if (!query) {
            hideSuggestions(suggestionsBox);
            return;
        }

        const matches = STATIONS.filter(station =>
            station.name.toLowerCase().includes(query) ||
            station.code.toLowerCase().includes(query)
        ).slice(0, 8);

        suggestionsBox.innerHTML = "";

        if (matches.length === 0) {
            suggestionsBox.innerHTML =
                `<div class="suggestion-empty">No matching stations</div>`;
            suggestionsBox.classList.add("active");
            return;
        }

        matches.forEach(station => {

            const item = document.createElement("div");

            item.className = "suggestion-item";
            item.textContent = `${station.name} (${station.code})`;

            item.addEventListener("click", () => {
                inputEl.value = `${station.name} (${station.code})`;
                hideSuggestions(suggestionsBox);
            });

            suggestionsBox.appendChild(item);
        });

        suggestionsBox.classList.add("active");
    }

    function setupAutocomplete(inputEl, suggestionsBox) {

        if (!inputEl || !suggestionsBox) {
            console.error("Autocomplete elements missing for a station input.");
            return;
        }

        inputEl.addEventListener("input", () => {
            showSuggestions(inputEl, suggestionsBox);
        });

        inputEl.addEventListener("focus", () => {
            showSuggestions(inputEl, suggestionsBox);
        });
    }

    setupAutocomplete(fromInput, fromSuggestions);
    setupAutocomplete(toInput, toSuggestions);

    // Close any open dropdown when clicking elsewhere on the page
    document.addEventListener("click", (event) => {

        if (
            fromSuggestions &&
            !fromInput.contains(event.target) &&
            !fromSuggestions.contains(event.target)
        ) {
            hideSuggestions(fromSuggestions);
        }

        if (
            toSuggestions &&
            !toInput.contains(event.target) &&
            !toSuggestions.contains(event.target)
        ) {
            hideSuggestions(toSuggestions);
        }
    });


    // =====================================================
    // SEARCH TRAINS
    // =====================================================

    searchButton.addEventListener("click", searchTrains);


    async function searchTrains() {

        // Turn the typed/selected values into known station codes.
        // Accepts "Kollam Jn (QLN)", a bare code like "QLN", or a full name.
        const from = resolveStationCode(fromInput.value);
        const to = resolveStationCode(toInput.value);

        if (!from || !to) {

            alert("Please select valid From and To stations.");

            return;
        }


        // Show loading
        searchButton.disabled = true;
        searchButton.textContent = "Searching...";


        trainList.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px;
                font-size: 16px;
            ">
                Loading trains...
            </div>
        `;


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/trains/between/${from}/${to}`
            );


            if (!response.ok) {
                throw new Error("Backend request failed");
            }


            const trains = await response.json();

            console.log("Train data received:", trains);

            displayTrains(trains, from, to);

            if (response.headers.get("X-Data-Source") === "fallback") {
                trainList.insertAdjacentHTML("afterbegin", `
                    <p style="text-align: center; color: #b26a00; padding: 8px;">
                        Live train data is unavailable right now - showing sample trains.
                    </p>
                `);
            }

            history.replaceState(null, "", `?from=${from}&to=${to}`);


        } catch (error) {

            console.error("Train search error:", error);

            trainList.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px;
                    color: #d32f2f;
                ">
                    <h3>Unable to load trains</h3>

                    <p>
                        Please make sure the backend server is running
                        on port 5000.
                    </p>
                </div>
            `;

        } finally {

            searchButton.disabled = false;
            searchButton.textContent = "🔍 Search";
        }
    }



    // =====================================================
    // DISPLAY TRAINS
    // =====================================================

    function displayTrains(trains, from, to) {

        if (!Array.isArray(trains) || trains.length === 0) {

            trainList.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px;
                    color: #666;
                ">
                    <h3>No trains found</h3>

                    <p>
                        No trains are available between
                        ${escapeHTML(from)} and ${escapeHTML(to)}.
                    </p>
                </div>
            `;

            return;
        }


        trainList.innerHTML = "";


        trains.forEach(train => {

            const card = document.createElement("div");

            card.className = "train-card";

            const trainNumber = escapeHTML(train.trainNumber || "N/A");
            const trainName = escapeHTML(train.trainName || "Express");
            const detailsQuery =
                `train=${encodeURIComponent(train.trainNumber || "")}` +
                `&trainName=${encodeURIComponent(train.trainName || "")}`;


            card.innerHTML = `

                <div class="train-header">

                    <div class="train-title">

                        <span class="train-number">
                            ${trainNumber}
                        </span>

                        <span class="train-name">
                            ${trainName}
                        </span>

                    </div>

                    <span class="train-type">
                        Express
                    </span>

                </div>


                <div class="route">
                    ${escapeHTML(stationLabel(from))} → ${escapeHTML(stationLabel(to))}
                </div>


                <div class="train-timing">

                    <div class="time departure">

                        <div class="time-value">
                            ${escapeHTML(train.departureTime || "N/A")}
                        </div>

                        <div class="station-code">
                            ${escapeHTML(from)}
                        </div>

                    </div>


                    <div class="route-line">

                        <span class="line"></span>

                    </div>


                    <div class="time arrival">

                        <div class="time-value">
                            ${escapeHTML(train.arrivalTime || "N/A")}
                        </div>

                        <div class="station-code">
                            ${escapeHTML(to)}
                        </div>

                    </div>

                </div>


                <div class="train-footer">

                    <span class="running-days">
                        ⏱ ${escapeHTML(train.travelTime || "N/A")}
                    </span>

                    <span class="train-links">
                        <a href="tracking.html?${detailsQuery}">Live Status</a>
                        ·
                        <a href="coach.html?${detailsQuery}">Coach Position</a>
                    </span>

                </div>
            `;


            trainList.appendChild(card);

        });
    }



    // =====================================================
    // SWAP FROM / TO
    // =====================================================

    swapButton.addEventListener("click", () => {

        const temporaryValue = fromInput.value;

        fromInput.value = toInput.value;
        toInput.value = temporaryValue;

    });



    // =====================================================
    // CLEAR BUTTONS
    // =====================================================

    clearButtons.forEach((button, index) => {

        button.addEventListener("click", () => {

            if (index === 0) {
                fromInput.value = "";
                hideSuggestions(fromSuggestions);
            }

            if (index === 1) {
                toInput.value = "";
                hideSuggestions(toSuggestions);
            }

        });

    });



    // =====================================================
    // FIND TRAINS / TRACK TRAIN TABS
    // =====================================================

    tabs.forEach((tab, index) => {

        tab.addEventListener("click", () => {

            tabs.forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");


            if (index === 0) {

                console.log("Find Trains selected");

            } else {

                window.location.href = "tracking.html";

            }

        });

    });



    // =====================================================
    // LANGUAGE BUTTON
    // =====================================================

    languageButton.addEventListener("click", () => {

        alert("Language selection will be added later.");

    });



    // =====================================================
    // JOURNEY PLANNER CLOSE
    // =====================================================

    if (plannerClose && journeyPlanner) {

        plannerClose.addEventListener("click", () => {

            journeyPlanner.style.display = "none";

        });

    }



    // =====================================================
    // INITIAL SEARCH (train-list.html?from=QLN&to=ERS)
    // =====================================================

    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get("from");
    const toParam = urlParams.get("to");

    if (fromParam && toParam) {
        fromInput.value = stationLabel(fromParam.toUpperCase());
        toInput.value = stationLabel(toParam.toUpperCase());
    }

    // Replace the static sample cards with backend results for the current route
    searchTrains();

});