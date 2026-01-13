
const fs = require('fs');
const path = require('path');

console.log("Checking environment...");

// Try to read .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    console.log(".env.local found!");
    const content = fs.readFileSync(envPath, 'utf-8');
    console.log("Content preview:", content.substring(0, 50) + "...");
} else {
    console.error(".env.local NOT found!");
}

// We can try to load it manually to test the URL
require('dotenv').config({ path: '.env.local' });
console.log("Loaded dotenv. GOOGLE_SCRIPT_URL:", process.env.GOOGLE_SCRIPT_URL);

if (process.env.GOOGLE_SCRIPT_URL) {
    console.log("Attempting fetch...");
    fetch(process.env.GOOGLE_SCRIPT_URL + "?action=getClassifications")
        .then(res => res.json())
        .then(data => console.log("Fetch success! Data length:", data.length))
        .catch(err => console.error("Fetch failed:", err));
} else {
    console.error("GOOGLE_SCRIPT_URL is missing!");
}
