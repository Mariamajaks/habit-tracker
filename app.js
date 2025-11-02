document.addEventListener('DOMContentLoaded', () => {
  const HABIT_KEY = 'habits';
  let habits = [];

  // --- DOM Elements ---
  const habitForm = document.getElementById('habit-form');
  const habitInput = document.getElementById('habit-name');
  const rowsContainer = document.getElementById('rows');
  const weekRangeElement = document.getElementById('week-range');
  const exportBtn = document.getElementById('export-json');
  const importInput = document.getElementById('import-json');
  const resetBtn = document.getElementById('reset-all');

  // --- State Management ---
  const loadHabits = () => {
    const data = localStorage.getItem(HABIT_KEY);
    habits = data ? JSON.parse(data) : [];
  };

  const saveHabits = () => {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
  };

  // --- Date Helpers ---
  const getWeekKeys = () => {
    const keys = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      keys.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }
    return keys;
  };

  // --- UI Rendering ---
  const updateWeekRange = () => {
    const keys = getWeekKeys();
    const start = new Date(keys[0]);
    const end = new Date(keys[6]);
    const format = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (weekRangeElement) {
      weekRangeElement.textContent = `${format(start)} - ${format(end)}`;
    }
  };

  const render = () => {
    loadHabits();
    updateWeekRange();
    rowsContainer.innerHTML = '';
    const weekKeys = getWeekKeys();

    habits.forEach((habit, habitIndex) => {
      const row = document.createElement('div');
      row.className = 'grid habit-row';

      // Calculate streak
      let streak = 0;
      let streakBroken = false;
      for (let i = weekKeys.length - 1; i >= 0; i--) {
        if (habit.dates[weekKeys[i]]) {
          streak++;
        } else {
          streakBroken = true;
          break;
        }
      }
      if (!streakBroken) { // Check older dates if streak is full for the week
        let dayBefore = new Date(weekKeys[0]);
        dayBefore.setDate(dayBefore.getDate() - 1);
        while (habit.dates[dayBefore.toISOString().split('T')[0]]) {
          streak++;
          dayBefore.setDate(dayBefore.getDate() - 1);
        }
      }

      let cellsHtml = '';
      weekKeys.forEach(key => {
        const isToggled = habit.dates[key];
        cellsHtml += `
          <div 
            class="day-cell ${isToggled ? 'toggled' : ''}" 
            data-habit-index="${habitIndex}" 
            data-date-key="${key}"
            role="button"
            tabindex="0"
            aria-pressed="${isToggled ? 'true' : 'false'}"
            aria-label="Habit: ${habit.name}, Date: ${new Date(key).toDateString()}, Status: ${isToggled ? 'Completed' : 'Incomplete'}">
            ${isToggled ? 'Yes' : ''}
          </div>`;
      });

      row.innerHTML = `
        <div style="text-align: left;">${habit.name}</div>
        ${cellsHtml}
        <div>${streak}</div>
        <div class="habit-actions">
          <button class="btn" data-tick-index="${habitIndex}">Tick today</button>
          <button class="btn-danger" data-delete-index="${habitIndex}">Delete</button>
        </div>
      `;
      rowsContainer.appendChild(row);
    });
  };

  // --- Event Handlers ---
  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const habitName = habitInput.value.trim();
    if (habitName) {
      habits.push({ id: Date.now(), name: habitName, dates: {} });
      saveHabits();
      render();
      habitInput.value = '';
      habitInput.focus();
    }
  });

  rowsContainer.addEventListener('click', (e) => {
    const { habitIndex, dateKey } = e.target.dataset;

    // Toggle day cell
    if (e.target.classList.contains('day-cell')) {
      habits[habitIndex].dates[dateKey] = !habits[habitIndex].dates[dateKey];
      saveHabits();
      render();
    }

    // Tick today button
    if (e.target.dataset.tickIndex) {
      const todayKey = getWeekKeys().pop();
      habits[e.target.dataset.tickIndex].dates[todayKey] = true;
      saveHabits();
      render();
    }

    // Delete button
    if (e.target.dataset.deleteIndex) {
      if (confirm(`Are you sure you want to delete the habit "${habits[e.target.dataset.deleteIndex].name}"?`)) {
        habits.splice(e.target.dataset.deleteIndex, 1);
        saveHabits();
        render();
      }
    }
  });
  
  // Keyboard accessibility for toggling cells
  rowsContainer.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && e.target.classList.contains('day-cell')) {
      e.preventDefault(); // Prevent page scroll on Space
      e.target.click();
    }
  });

  // Data Management Handlers
  exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(habits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'habits.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedHabits = JSON.parse(event.target.result);
        if (Array.isArray(importedHabits)) { // Basic validation
          if (confirm('This will overwrite your current habits. Are you sure?')) {
            habits = importedHabits;
            saveHabits();
            render();
          }
        } else {
          alert('Invalid file format.');
        }
      } catch (error) {
        alert('Error reading file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    importInput.value = ''; // Reset input
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      habits = [];
      saveHabits();
      render();
    }
  });

  // --- Initial Load ---
  render();
});