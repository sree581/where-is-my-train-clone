// Shared frontend settings. Loaded before each page's own script.
//
// Recommended: start the backend (npm start) and open http://localhost:5000.
// The backend then serves the pages AND answers this file itself with
// "the API is on this same address", so this file isn't used at all.
//
// This file is only used when the pages are opened some other way
// (double-clicking index.html, VS Code Live Server, ...). Change the URL
// below if your backend runs on a different host or port.
window.APP_CONFIG = {
  API_BASE_URL: 'http://localhost:5000'
};
