// Get train details from URL
const params = new URLSearchParams(window.location.search);

const trainNumber = params.get("trainNumber");
const trainName = params.get("trainName");

const trainTitle = document.getElementById("train-title");

if (trainNumber && trainName) {
    trainTitle.textContent = `${trainNumber} - ${trainName}`;
} else {
    trainTitle.textContent = "Train details unavailable";
}

const coaches = [
    {
        name: "GEN",
        type: "General",
        layout: "general"
    },

    {
        name: "GEN",
        type: "General",
        layout: "general"
    },

    {
        name: "A1",
        type: "AC 2-Tier",
        layout: "ac2"
    },

    {
        name: "B1",
        type: "AC 3-Tier",
        layout: "ac3"
    },

    {
        name: "B2",
        type: "AC 3-Tier",
        layout: "ac3"
    },

    {
        name: "B3",
        type: "AC 3-Tier",
        layout: "ac3"
    },

    {
        name: "B4",
        type: "AC 3-Tier",
        layout: "ac3"
    },

    {
        name: "B5",
        type: "AC 3-Tier",
        layout: "ac3"
    },

    {
        name: "B6",
        type: "AC 3-Tier",
        layout: "ac3"
    },

    {
        name: "S1",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S2",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S3",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S4",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S5",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S6",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S7",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S8",
        type: "Sleeper",
        layout: "sleeper"
    },

    {
        name: "S9",
        type: "Sleeper",
        layout: "sleeper"
    }
];


let selected = 3;

const coachList = document.getElementById("coach-list");
const coachTitle = document.getElementById("coach-title");


function renderSelector() {

    coachList.innerHTML = "";

    const train = document.createElement("div");

    train.className = "coach-item";

    train.innerHTML = `
        <div class="train-icon">🚂</div>
    `;

    coachList.appendChild(train);


    coaches.forEach((coach, index) => {

        const item = document.createElement("div");

        item.className =
            "coach-item" +
            (index === selected ? " selected" : "");

        item.innerHTML = `
            <div class="coach-box">
                ${coach.name}
            </div>

            <div class="coach-number">
                ${index + 1}
            </div>
        `;


        item.onclick = () => {

            selected = index;

            updateHeader();

            renderSelector();

            renderLayout();

        };


        coachList.appendChild(item);

    });
}


/* HEADER */

function updateHeader() {

    const coach = coaches[selected];

    coachTitle.textContent =
        `${coach.name} - ${coach.type}`;
}


/* LAYOUT */

function renderLayout() {

    const coach = coaches[selected];

    const container =
        document.getElementById("coach-layout");

    container.innerHTML = "";


    if (coach.layout === "general") {
        renderGeneral(container);
    }

    else if (coach.layout === "ac2") {
        renderAC2(container);
    }

    else if (coach.layout === "ac3") {
        renderAC3(container);
    }

    else if (coach.layout === "sleeper") {
        renderSleeper(container);
    }
}


/* GENERAL */

function renderGeneral(container) {

    container.innerHTML = `
        <div class="general-compartment">
            General Compartment
        </div>
    `;
}


/* AC 3-TIER */

function renderAC3(container) {

    const coach = document.createElement("div");

    coach.className = "coach-outline";

    coach.innerHTML = `

        <div class="connector top"></div>
        <div class="connector bottom"></div>

        <div class="aisle"></div>

        <div class="left-berths">

            ${createThreeBerthGroup(1, 2, 3)}

            ${createThreeBerthGroup(4, 5, 6)}

            ${createThreeBerthGroup(9, 10, 11)}

            ${createThreeBerthGroup(12, 13, 14)}

        </div>

        <div class="right-berths">

            ${createSideBerth(7, "S.LOWER")}

            ${createSideBerth(8, "S.UPPER")}

            ${createSideBerth(15, "S.LOWER")}

            ${createSideBerth(16, "S.UPPER")}

        </div>

    `;

    container.appendChild(coach);
}


/* AC 2-TIER */

function renderAC2(container) {

    const coach = document.createElement("div");

    coach.className = "coach-outline";

    coach.innerHTML = `

        <div class="connector top"></div>
        <div class="connector bottom"></div>

        <div class="aisle"></div>

        <div class="left-berths">

            ${createTwoBerthGroup(1, 2)}

            ${createTwoBerthGroup(3, 4)}

            ${createTwoBerthGroup(7, 8)}

            ${createTwoBerthGroup(9, 10)}

            ${createTwoBerthGroup(13, 14)}

            ${createTwoBerthGroup(15, 16)}

        </div>

        <div class="right-berths">

            ${createSideBerth(5, "S.LOWER")}

            ${createSideBerth(6, "S.UPPER")}

            ${createSideBerth(11, "S.LOWER")}

            ${createSideBerth(12, "S.UPPER")}

            ${createSideBerth(17, "S.LOWER")}

            ${createSideBerth(18, "S.UPPER")}

        </div>

    `;

    container.appendChild(coach);
}


/* SLEEPER */

function renderSleeper(container) {

    const coach = document.createElement("div");

    coach.className = "coach-outline";

    coach.innerHTML = `

        <div class="connector top"></div>
        <div class="connector bottom"></div>

        <div class="aisle"></div>

        <div class="left-berths">

            ${createThreeBerthGroup(1, 2, 3)}

            ${createThreeBerthGroup(4, 5, 6)}

            ${createThreeBerthGroup(9, 10, 11)}

            ${createThreeBerthGroup(12, 13, 14)}

            ${createThreeBerthGroup(17, 18, 19)}

            ${createThreeBerthGroup(20, 21, 22)}

            ${createThreeBerthGroup(25, 26, 27)}

            ${createThreeBerthGroup(28, 29, 30)}

            ${createThreeBerthGroup(33, 34, 35)}

            ${createThreeBerthGroup(36, 37, 38)}

        </div>

        <div class="right-berths">

            ${createSideBerth(7, "S.LOWER")}

            ${createSideBerth(8, "S.UPPER")}

            ${createSideBerth(15, "S.LOWER")}

            ${createSideBerth(16, "S.UPPER")}

            ${createSideBerth(23, "S.LOWER")}

            ${createSideBerth(24, "S.UPPER")}

            ${createSideBerth(31, "S.LOWER")}

            ${createSideBerth(32, "S.UPPER")}

            ${createSideBerth(39, "S.LOWER")}

            ${createSideBerth(40, "S.UPPER")}

        </div>

    `;

    container.appendChild(coach);
}


/* THREE BERTH GROUP */

function createThreeBerthGroup(a, b, c) {

    return `
        <div class="berth-group three">

            <div class="seat">
                <span>${a}</span>
                <small>LOWER</small>
            </div>

            <div class="seat">
                <span>${b}</span>
                <small>MIDDLE</small>
            </div>

            <div class="seat">
                <span>${c}</span>
                <small>UPPER</small>
            </div>

        </div>
    `;
}


/* TWO BERTH GROUP */

function createTwoBerthGroup(a, b) {

    return `
        <div class="berth-group two">

            <div class="seat">
                <span>${a}</span>
                <small>LOWER</small>
            </div>

            <div class="seat">
                <span>${b}</span>
                <small>UPPER</small>
            </div>

        </div>
    `;
}


/* SIDE BERTH */

function createSideBerth(number, type) {

    return `
        <div class="side-seat">

            <span>${number}</span>

            <small>${type}</small>

        </div>
    `;
}


/* INITIAL LOAD */

updateHeader();

renderSelector();

renderLayout();