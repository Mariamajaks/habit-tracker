// =======================================================
// HABIT TRACKER APP - Fully Updated app.js
// =======================================================

// Get reference to rows container
const rows = document.getElementById("rows");

// Load saved state safely from localStorage
let state;
try {
  state = JSON.parse(localStorage.getItem("habitTrackerState")) || { habits: [] };
} catch (e) {
  state = { habits: [] };
}

// =======================================================
// DATE HELPERS
// =======================================================

// Get today's date as "YYYY-MM-DD"
function todayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// Get array of last 7 dates for the week view
function getWeekKeys() {
  const keys = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(d.getDate() - i);
    keys.push(date.toISOString().split("T")[0]);
  }
  return keys;
}

const weekKeys = getWeekKeys();

// =======================================================
// STATE HELPERS
// =======================================================

// Create new habit object
function newHabit(name) {
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: name,
    log: {}
  };
}

// Save state to localStorage
function saveState(stateObj) {
  localStorage.setItem("habitTrackerState", JSON.stringify(stateObj));
}

// Compute consecutive streak up to today
function computeStreak(habit) {
  let count = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (habit.log[key]) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

// =======================================================
// RENDER UI
// =======================================================
function render() {
  rows.innerHTML = "";

  // Placeholder for no habits
  if (state.habits.length === 0) {
    const row = document.createElement("div");
    row.setAttribute("style", "display:grid;grid-template-columns:1.6fr repeat(7,.9fr) .8fr 1fr;align-items:center;border-bottom:1px solid #eef2f6;");

    const nameCol = document.createElement("div");
    nameCol.setAttribute("style", "padding:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
    nameCol.textContent = "No habits yet";
    row.appendChild(nameCol);

    weekKeys.forEach(() => {
      const col = document.createElement("div");
      col.setAttribute("style", "padding:10px;text-align:center;");
      row.appendChild(col);
    });

    const streakCol = document.createElement("div");
    streakCol.setAttribute("st
