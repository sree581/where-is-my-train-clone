const spotForm = document.getElementById('spot-form');
const resultsContainer = document.getElementById('results-container');

spotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const trainQuery = document.getElementById('train-query').value.trim();

  if (!trainQuery) return;

  resultsContainer.classList.remove('hidden');
  resultsContainer.innerHTML = `<p style="padding: 10px;">Searching live status for ${trainQuery}...</p>`;

  try {
    const response = await fetch(`http://localhost:5000/api/trains/spot/${trainQuery}`);
    const data = await response.json();

    // Render Live Train Status
    resultsContainer.innerHTML = `
      <h3>${data.trainNumber} - ${data.trainName}</h3>
      <p style="color: green; margin: 10px 0;"><strong>Status:</strong> ${data.status}</p>
      <p style="font-size: 0.9rem; color: #555; margin-bottom: 15px;">
        <strong>Current Location:</strong> ${data.currentStation}
      </p>
      
      <ul class="timeline">
        ${data.schedule.map(stn => `
          <li class="station-node">
            <strong>${stn.station}</strong> 
            <span style="font-size: 0.8rem; color: ${stn.status === 'Current' ? 'orange' : 'gray'}">
              (${stn.status})
            </span><br>
            <small>Time: ${stn.dep || stn.arr} | Day ${stn.day}</small>
          </li>
        `).join('')}
      </ul>
    `;
  } catch (err) {
    resultsContainer.innerHTML = `<p style="color: red;">Failed to fetch train details. Is the backend server running?</p>`;
  }
});