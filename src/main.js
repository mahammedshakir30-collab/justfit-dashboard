// FitAI Client Runtime Controller
import { initAuth, logout } from './auth';
import { getAppState, saveAppState, resetAppState, logWater, logMeal, logWorkout } from './data';
import { getJustFitResponse } from './fitai';
import { checkAndTriggerAchievements } from './gamification';
import { initCharts } from './charts';

// Global application state instance
let state = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial State Hydration
  state = getAppState();
  
  // 2. Initialize Router and Navigation
  initNavigation();
  
  // 3. Initialize Authentication Layer
  initAuth((sessionUser) => {
    // Callback after successful login/onboarding
    state = getAppState();
    
    // Refresh all telemetry and layout properties
    refreshUI();
  });
});

// --- MODULE: SPA VIEW ROUTER ---
function initNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const views = document.querySelectorAll('.view-panel');
  const viewTitle = document.getElementById('view-title');
  const menuToggle = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');

  // Sidebar link clicks
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetView = link.getAttribute('data-view');
      const cleanTitle = link.querySelector('span').textContent;
      
      // Update sidebar state
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Update views visible
      views.forEach(v => {
        if (v.id === `view-${targetView}`) {
          v.style.display = 'block';
        } else {
          v.style.display = 'none';
        }
      });
      
      // Set header titles
      viewTitle.textContent = cleanTitle;
      
      // On mobile, collapse sidebar after click
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
    });
  });

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });
  }

  // Close sidebar on outer tap
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuToggle) {
      sidebar.classList.remove('active');
    }
  });

  // Initialize modular controllers
  initWorkoutStopwatch();
  initWaterTracker();
  initMoodWellnessLogger();
  initMindfulnessBreathing();
  initWorkoutForm();
  initMealForm();
  initChatbotDrawer();
  initNotifications();
  initProfileDrawer();
  
  // Connect Settings buttons
  document.getElementById('reset-app-state-btn').addEventListener('click', () => {
    if (confirm("Reset application memory? All active streaks and logged inputs will be permanently removed.")) {
      state = resetAppState();
      refreshUI();
      location.reload();
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    logout();
  });

  // accessibility toggles
  document.getElementById('accessibility-large-text-btn').addEventListener('change', (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  });

  document.getElementById('accessibility-high-contrast-btn').addEventListener('change', (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  });
}

// --- MODULE: DATA CONSOLIDATION & INTERFACE REDRAW ---
function refreshUI() {
  state = getAppState();

  // A. Header user tier metrics
  document.getElementById('header-avatar').src = state.user.avatarUrl;
  document.getElementById('header-user-name').textContent = state.user.fullName;
  
  const xpProgress = Math.min(100, Math.floor((state.gamification.xp % 500) / 5));
  document.getElementById('xp-progress-bar').style.width = `${xpProgress}%`;
  document.getElementById('xp-text').textContent = `${state.gamification.xp % 500} / 500 XP`;
  document.getElementById('level-label').textContent = `Lvl ${state.gamification.level}`;
  
  document.getElementById('streak-count').textContent = `${state.gamification.currentStreak} Days`;
  document.getElementById('coin-count').textContent = `${state.gamification.coins} Coins`;

  // B. Dashboard View Elements
  document.getElementById('dash-user-name').textContent = state.user.fullName.split(' ')[0];
  
  const weight = state.user.weightKg;
  const height = state.user.heightCm;
  const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
  document.getElementById('dash-bmi-val').textContent = bmi;

  // Stats
  document.getElementById('dash-steps-val').textContent = state.daily.steps.toLocaleString();
  const stepsPct = Math.min(100, Math.floor((state.daily.steps / state.daily.stepsGoal) * 100));
  document.getElementById('dash-steps-progress').style.width = `${stepsPct}%`;

  document.getElementById('dash-calories-val').innerHTML = `${state.daily.caloriesBurned} <span style="font-size: 1rem; color: var(--text-muted);">kcal</span>`;
  const calPct = Math.min(100, Math.floor((state.daily.caloriesBurned / state.daily.caloriesBurnedGoal) * 100));
  document.getElementById('dash-calories-progress').style.width = `${calPct}%`;

  document.getElementById('dash-water-val').innerHTML = `${state.daily.waterIntakeMl} <span style="font-size: 1.1rem;">ml</span>`;
  const waterPct = Math.min(100, Math.floor((state.daily.waterIntakeMl / state.daily.waterGoalMl) * 100));
  document.getElementById('dash-water-progress').style.width = `${waterPct}%`;

  document.getElementById('dash-sleep-val').innerHTML = `${state.daily.sleepScore} <span style="font-size: 1rem; color: var(--text-muted);">score</span>`;
  const sleepPct = Math.min(100, state.daily.sleepScore);
  document.getElementById('dash-sleep-progress').style.width = `${sleepPct}%`;

  // Telemetry details
  document.getElementById('dash-hr-val').textContent = `${state.daily.heartRateBpm} bpm`;
  document.getElementById('dash-stress-val').textContent = `${state.daily.stressLevel} / 10`;

  // Lists Redraws
  renderRecentWorkouts();
  renderMealHistory();
  renderGamifiedLists();
  
  // C. Recolor/re-init Apex Charts
  initCharts(state);
}

// Draw recent logs list
function renderRecentWorkouts() {
  const container = document.getElementById('dash-recent-activities');
  const fitnessList = document.getElementById('fitness-history-list');
  if (!container) return;
  
  container.innerHTML = '';
  fitnessList.innerHTML = '';
  
  if (state.workouts.length === 0) {
    const fallback = `<p style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">No exercises logged yet.</p>`;
    container.innerHTML = fallback;
    fitnessList.innerHTML = fallback;
    return;
  }

  state.workouts.forEach(w => {
    // Define dynamic icons
    let icon = "dumbbell";
    if (w.type === "Running" || w.type === "Walking") icon = "footprints";
    if (w.type === "Cycling") icon = "bike";
    if (w.type === "Swimming") icon = "waves";
    
    const rowHtml = `
      <div class="activity-item">
        <div class="activity-details">
          <div class="activity-icon">
            <i data-lucide="${icon}"></i>
          </div>
          <div class="activity-meta">
            <h4>${w.type}</h4>
            <p>${w.time} • ${w.duration} mins</p>
          </div>
        </div>
        <div class="activity-metrics">
          <span class="activity-value">+${w.calories} kcal</span>
          <p class="activity-subval">${w.distance > 0 ? w.distance + ' km' : 'Indoor Circuit'}</p>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', rowHtml);
    fitnessList.insertAdjacentHTML('beforeend', rowHtml);
  });
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Draw food list
function renderMealHistory() {
  const list = document.getElementById('nutrition-meals-list');
  const calSum = document.getElementById('nutrition-calories-summary');
  
  if (!list) return;
  list.innerHTML = '';
  
  // Macros text summary update
  const macros = state.daily.macros;
  calSum.textContent = `${macros.caloriesConsumed} / ${macros.caloriesGoal} Kcal`;
  
  document.getElementById('nut-p-val').textContent = `${macros.proteinG}g / ${macros.proteinGoal}g`;
  document.getElementById('nut-c-val').textContent = `${macros.carbsG}g / ${macros.carbsGoal}g`;
  document.getElementById('nut-f-val').textContent = `${macros.fatG}g / ${macros.fatGoal}g`;

  if (state.meals.length === 0) {
    list.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">No foods logged today.</p>`;
    return;
  }

  state.meals.forEach(m => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-details">
        <div class="activity-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--primary-color);">
          <i data-lucide="cooking-pot"></i>
        </div>
        <div class="activity-meta">
          <h4>${m.name}</h4>
          <p style="text-transform: capitalize;">${m.type} • P: ${m.protein}g | C: ${m.carbs}g | F: ${m.fat}g</p>
        </div>
      </div>
      <div class="activity-metrics">
        <span class="activity-value">${m.calories} kcal</span>
      </div>
    `;
    list.appendChild(item);
  });

  if (window.lucide) window.lucide.createIcons();
}

// Draw challenges list and badges unlocked grid
function renderGamifiedLists() {
  const chalList = document.getElementById('challenges-active-list');
  const badgeGrid = document.getElementById('badges-unlocked-grid');
  if (!chalList) return;

  chalList.innerHTML = '';
  badgeGrid.innerHTML = '';

  // Draw challenges
  state.challenges.forEach(c => {
    const pct = Math.min(100, Math.floor((c.current / c.target) * 100));
    const card = document.createElement('div');
    card.className = `glass-card challenge-card ${c.status === 'completed' ? 'completed' : ''}`;
    card.style.padding = '1.25rem';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <h4 style="font-weight: 700; font-size: 0.95rem;">${c.name}</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">${c.desc}</p>
        </div>
        <span style="font-size: 0.7rem; font-weight: 700; color: var(--accent-color); background: rgba(139, 92, 246, 0.1); padding: 0.15rem 0.5rem; border-radius: 4px;">
          ${c.status === 'completed' ? 'Claimed' : `+${c.xp} XP`}
        </span>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; margin-top: 1rem; margin-bottom: 0.25rem;">
        <span>Progress</span>
        <span style="font-weight: 700;">${c.current} / ${c.target}</span>
      </div>
      <div class="stat-progress-container" style="margin-top: 0;">
        <div class="stat-progress-bar" style="width: ${pct}%; background: var(--accent-color);"></div>
      </div>
    `;
    chalList.appendChild(card);
  });

  // Draw unlocked achievements/badges
  state.achievements.forEach(a => {
    const card = document.createElement('div');
    card.className = `badge-item ${a.unlocked ? '' : 'locked'}`;
    card.innerHTML = `
      <div class="badge-icon-wrapper">
        <i data-lucide="${a.icon}"></i>
      </div>
      <span class="badge-name">${a.name}</span>
      <span class="badge-unlocked-date">${a.unlocked ? 'Unlocked ' + a.date : 'Locked'}</span>
    `;
    badgeGrid.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

// --- MODULE: STOPWATCH CONTROLLER ---
function initWorkoutStopwatch() {
  const display = document.getElementById('stopwatch-display');
  const startBtn = document.getElementById('timer-start-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  const ring = document.getElementById('timer-progress-ring');

  let seconds = 0;
  let timerId = null;

  const updateDisplay = () => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}`;
    
    // Animate circular dash offset (visual tick)
    const perimeter = 2 * Math.PI * 90; // hollow radius = 90
    const offset = perimeter - ((seconds % 60) / 60) * perimeter;
    ring.style.strokeDashoffset = offset;
  };

  startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    timerId = setInterval(() => {
      seconds++;
      updateDisplay();
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    pauseBtn.style.display = 'none';
    startBtn.style.display = 'inline-flex';
    clearInterval(timerId);
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    seconds = 0;
    updateDisplay();
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    ring.style.strokeDashoffset = 0;
  });
}

// --- MODULE: WATER LOGGING ACTIONS ---
function initWaterTracker() {
  const add250 = document.getElementById('water-add-250-btn');
  const add500 = document.getElementById('water-add-500-btn');
  const wave = document.getElementById('water-wave-element');
  const valText = document.getElementById('nutrition-water-val');

  const animateWaterFill = () => {
    state = getAppState();
    const pct = Math.min(100, Math.floor((state.daily.waterIntakeMl / state.daily.waterGoalMl) * 100));
    valText.textContent = `${state.daily.waterIntakeMl} / ${state.daily.waterGoalMl} ml`;
    
    // Wave height element fill
    gsap.to(wave, {
      height: `${pct}%`,
      duration: 0.8,
      ease: "power2.out"
    });
  };

  const handleWaterClick = (amt) => {
    logWater(state, amt);
    animateWaterFill();
    refreshUI();
    
    // Trigger achievements checker dynamically
    checkAndTriggerAchievements(state);
  };

  add250.addEventListener('click', () => handleWaterClick(250));
  add500.addEventListener('click', () => handleWaterClick(500));
  
  // Set initial height
  animateWaterFill();
}

// --- MODULE: MINDFUL BREATH BUBBLE ---
function initMindfulnessBreathing() {
  const bubble = document.getElementById('breathing-bubble-element');
  const label = document.getElementById('breathing-instruction-text');
  const toggleBtn = document.getElementById('breathing-toggle-btn');
  
  let isActive = false;
  let breathTl = null;

  const stopExercise = () => {
    isActive = false;
    toggleBtn.querySelector('span').textContent = "Start Breath Exercise";
    label.textContent = "Take a breath...";
    if (breathTl) {
      breathTl.kill();
      gsap.to(bubble, { scale: 1, duration: 0.5 });
    }
  };

  const startExercise = () => {
    isActive = true;
    toggleBtn.querySelector('span').textContent = "Stop Exercise";
    
    // GSAP looping timeline (Inhale -> Hold -> Exhale -> Hold)
    breathTl = gsap.timeline({ repeat: -1 });
    
    breathTl
      .call(() => label.textContent = "Inhale...")
      .to(bubble, { scale: 1.6, duration: 4, ease: "sine.inOut" })
      .call(() => label.textContent = "Hold...")
      .to({}, { duration: 2 }) // hold
      .call(() => label.textContent = "Exhale...")
      .to(bubble, { scale: 1.0, duration: 4, ease: "sine.inOut" })
      .call(() => label.textContent = "Hold...")
      .to({}, { duration: 2 }); // hold
  };

  toggleBtn.addEventListener('click', () => {
    if (isActive) {
      stopExercise();
    } else {
      startExercise();
    }
  });
}

// --- MODULE: MOOD LOGGER ---
function initMoodWellnessLogger() {
  const form = document.getElementById('mood-form');
  const moodBtns = document.querySelectorAll('.mood-btn');
  const stressInput = document.getElementById('stress-range-input');
  const stressLabel = document.getElementById('stress-level-label');

  let selectedMood = "excellent"; // Default active

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMood = btn.getAttribute('data-mood');
    });
  });

  // Slider changes
  stressInput.addEventListener('input', (e) => {
    const val = e.target.value;
    let classification = "Mild";
    if (val > 3 && val <= 7) classification = "Moderate";
    if (val > 7) classification = "High";
    stressLabel.textContent = `${val} / 10 (${classification})`;
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    state.daily.mood = selectedMood;
    state.daily.stressLevel = parseInt(stressInput.value);
    
    addXP(state, 15); // Reward log with 15 XP
    saveAppState(state);
    
    triggerCelebration("Mental Wellness Logged!", "Successfully saved stress metrics and mood indicators.", "smile");
    refreshUI();
  });
}

// --- MODULE: WORKOUT LOGGER FORM ---
function initWorkoutForm() {
  const form = document.getElementById('log-workout-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const type = document.getElementById('workout-type').value;
    const dur = document.getElementById('workout-duration').value;
    const dist = document.getElementById('workout-distance').value;
    const cals = document.getElementById('workout-calories').value;
    
    logWorkout(state, type, dur, dist, cals);
    
    form.reset();
    triggerCelebration("Workout Session Saved!", `Successfully recorded ${type} session. Got +${Math.floor(cals / 10)} XP.`);
    refreshUI();
  });
}

// --- MODULE: MEAL LOGGER FORM ---
function initMealForm() {
  const form = document.getElementById('log-meal-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const cat = document.getElementById('meal-category').value;
    const name = document.getElementById('meal-name').value;
    const kcal = document.getElementById('meal-calories').value;
    const p = document.getElementById('meal-protein').value;
    const c = document.getElementById('meal-carbs').value;
    const f = document.getElementById('meal-fat').value;
    
    logMeal(state, cat, name, kcal, p, c, f);
    
    form.reset();
    triggerCelebration("Meal Logged!", `Successfully added ${name} to daily macros.`, "utensils");
    refreshUI();
  });
}

// --- MODULE: FLOATING CHATBOT DRAWER ---
function initChatbotDrawer() {
  const triggerBtn = document.getElementById('fitai-trigger-btn');
  const chatPanel = document.getElementById('fitai-chat-panel');
  const closeBtn = document.getElementById('fitai-chat-close-btn');
  
  const form = document.getElementById('fitai-input-form');
  const input = document.getElementById('fitai-message-input');
  const container = document.getElementById('fitai-messages-container');
  const chipsWrapper = document.getElementById('chat-chips-wrapper');
  
  // Expand / collapse trigger
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = chatPanel.style.display === 'flex';
    if (isOpen) {
      chatPanel.style.display = 'none';
      triggerBtn.setAttribute('aria-expanded', 'false');
    } else {
      chatPanel.style.display = 'flex';
      triggerBtn.setAttribute('aria-expanded', 'true');
      scrollChatToBottom();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatPanel.style.display = 'none';
    triggerBtn.setAttribute('aria-expanded', 'false');
  });

  // Close panel on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPanel.style.display === 'flex') {
      chatPanel.style.display = 'none';
      triggerBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Handle message send
  const sendUserMessage = (text) => {
    if (!text.trim()) return;
    
    // Add user message to state history
    state.aiChatHistory.push({ role: "user", content: text });
    saveAppState(state);
    
    renderChatHistory();
    input.value = '';
    
    // Loading indicator mock
    const loadingId = Date.now();
    const loadingHtml = `
      <div class="chat-bubble bot loading" id="loading-${loadingId}">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', loadingHtml);
    scrollChatToBottom();
    
    // Simulate AI response delay
    setTimeout(() => {
      const loader = document.getElementById(`loading-${loadingId}`);
      if (loader) loader.remove();
      
      const botResponse = getJustFitResponse(state, text);
      state.aiChatHistory.push({ role: "assistant", content: botResponse });
      saveAppState(state);
      
      renderChatHistory();
      addXP(state, 5); // Conversing with coach awards 5 XP
      refreshUI();
    }, 1200);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendUserMessage(input.value);
  });

  // Handle quick chip clicks
  chipsWrapper.addEventListener('click', (e) => {
    const chip = e.target.closest('.chat-chip');
    if (chip) {
      sendUserMessage(chip.getAttribute('data-question'));
    }
  });

  const renderChatHistory = () => {
    container.innerHTML = '';
    state.aiChatHistory.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`;
      
      if (msg.role === 'user') {
        bubble.textContent = msg.content;
      } else {
        // Parse markdown formatting inside assistant responses
        bubble.innerHTML = parseMarkdownToHTML(msg.content);
      }
      container.appendChild(bubble);
    });
    scrollChatToBottom();
  };

  const scrollChatToBottom = () => {
    container.scrollTop = container.scrollHeight;
  };

  // Redirect go-to-coach click from recommendations
  document.getElementById('go-to-ai-coach-btn').addEventListener('click', (e) => {
    e.preventDefault();
    chatPanel.style.display = 'flex';
    triggerBtn.setAttribute('aria-expanded', 'true');
    scrollChatToBottom();
    sendUserMessage("Generate today's workout.");
  });

  // Initial render
  renderChatHistory();
}

// Simple Markdown Parser for FitAI chat bubble
function parseMarkdownToHTML(md) {
  let html = md;
  
  // Replace Headings
  html = html.replace(/### (.*)/g, '<h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; color: #10b981;">$1</h3>');
  html = html.replace(/#### (.*)/g, '<h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.25rem;">$1</h4>');
  
  // Replace Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace Bullet Lists
  html = html.replace(/\*\s(.*)/g, '<li>$1</li>');
  // Wrap list items in <ul>
  // We can do this cleanly by splitting lines
  const lines = html.split('\n');
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('<li>') || lines[i].startsWith('  <li>')) {
      if (!inList) {
        lines[i] = '<ul style="margin-left: 1rem; margin-bottom: 0.5rem;">' + lines[i];
        inList = true;
      }
    } else {
      if (inList) {
        lines[i - 1] = lines[i - 1] + '</ul>';
        inList = false;
      }
    }
  }
  if (inList) {
    lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
  }
  html = lines.join('\n');
  
  // Replace Tables
  // Match lines with | structure
  const tableLines = html.split('\n');
  let inTable = false;
  let tableHeader = true;
  for (let i = 0; i < tableLines.length; i++) {
    if (tableLines[i].trim().startsWith('|') && tableLines[i].trim().endsWith('|')) {
      const cells = tableLines[i].split('|').map(c => c.trim()).filter(c => c !== '');
      if (tableLines[i].includes('---') || tableLines[i].includes(':::')) {
        // Skip separator line
        tableLines[i] = '';
        continue;
      }
      
      let tag = tableHeader ? 'th' : 'td';
      let rowHtml = '<tr>' + cells.map(c => `<${tag} style="padding: 4px 8px; border: 1px solid rgba(255,255,255,0.08);">${c}</${tag}>`).join('') + '</tr>';
      
      if (!inTable) {
        rowHtml = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; font-size: 0.8rem;">' + rowHtml;
        inTable = true;
      }
      tableLines[i] = rowHtml;
      tableHeader = false;
    } else {
      if (inTable) {
        tableLines[i - 1] = tableLines[i - 1] + '</table>';
        inTable = false;
        tableHeader = true;
      }
    }
  }
  html = tableLines.join('\n');
  
  // Replace simple line breaks
  html = html.replace(/\n/g, '<br>');
  // Cleanup duplicates
  html = html.replace(/<\/ul><br>/g, '</ul>');
  html = html.replace(/<\/table><br>/g, '</table>');
  
  return html;
}

// --- MODULE: APP POPOVER NOTIFICATIONS ---
function initNotifications() {
  const bellBtn = document.getElementById('notification-bell-btn');
  const popover = document.getElementById('notifications-popover');
  const listContainer = document.getElementById('notification-popover-list');
  const markReadBtn = document.getElementById('mark-all-read-btn');
  const badge = document.getElementById('notification-unread-badge');

  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = popover.style.display === 'block';
    if (isShowing) {
      popover.style.display = 'none';
    } else {
      renderNotifications();
      popover.style.display = 'block';
    }
  });

  document.addEventListener('click', (e) => {
    if (!popover.contains(e.target) && e.target !== bellBtn) {
      popover.style.display = 'none';
    }
  });

  const renderNotifications = () => {
    listContainer.innerHTML = '';
    const unreadCount = state.notifications.filter(n => !n.isRead).length;
    
    if (unreadCount > 0) {
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }

    if (state.notifications.length === 0) {
      listContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1rem;">No recent alerts.</p>`;
      return;
    }

    state.notifications.forEach(n => {
      const item = document.createElement('div');
      item.style.padding = '0.5rem';
      item.style.background = n.isRead ? 'transparent' : 'rgba(16, 185, 129, 0.05)';
      item.style.borderRadius = '6px';
      item.style.fontSize = '0.8rem';
      item.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
      item.innerHTML = `
        <p style="font-weight: ${n.isRead ? '400' : '600'}; color: var(--text-white);">${n.message}</p>
        <span style="font-size: 0.7rem; color: var(--text-muted);">${n.time}</span>
      `;
      listContainer.appendChild(item);
    });
  };

  markReadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    state.notifications.forEach(n => n.isRead = true);
    saveAppState(state);
    renderNotifications();
  });

  // Initial render
  renderNotifications();
}

// --- MODULE: USER PROFILE SLIDE DRAWER ---
function initProfileDrawer() {
  const trigger = document.getElementById('profile-drawer-trigger');
  const drawer = document.getElementById('profile-drawer');
  const closeBtn = document.getElementById('profile-drawer-close-btn');
  
  const editForm = document.getElementById('profile-edit-form');
  const nameInput = document.getElementById('edit-profile-name');
  const heightInput = document.getElementById('edit-profile-height');
  const weightInput = document.getElementById('edit-profile-weight');
  const goalSelect = document.getElementById('edit-profile-goal');

  // Trigger click -> Open slide out drawer
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    state = getAppState();
    
    // Fill in inputs
    nameInput.value = state.user.fullName;
    heightInput.value = state.user.heightCm;
    weightInput.value = state.user.weightKg;
    goalSelect.value = state.user.healthGoal;
    
    // Set avatar images in drawer
    document.getElementById('drawer-avatar').src = state.user.avatarUrl;
    document.getElementById('drawer-user-name').textContent = state.user.fullName;
    document.getElementById('drawer-user-email').textContent = state.user.email;
    
    drawer.classList.add('open');
  });

  closeBtn.addEventListener('click', () => {
    drawer.classList.remove('open');
  });

  // Close drawer if click happens outside
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !trigger.contains(e.target)) {
      drawer.classList.remove('open');
    }
  });

  // Update profile
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.user.fullName = nameInput.value;
    state.user.heightCm = parseFloat(heightInput.value);
    state.user.weightKg = parseFloat(weightInput.value);
    state.user.healthGoal = goalSelect.value;
    
    // Recalculate BMI based on inputs
    const weight = state.user.weightKg;
    const height = state.user.heightCm;
    const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
    state.daily.bmi = bmi;
    
    addXP(state, 10); // Reward edit with 10 XP
    saveAppState(state);
    
    drawer.classList.remove('open');
    
    // Update local community leaderboard
    document.getElementById('leaderboard-user-name').textContent = state.user.fullName;
    document.getElementById('leaderboard-user-avatar').src = state.user.avatarUrl;
    
    triggerCelebration("Profile Updated!", "Successfully updated biometric markers.");
    refreshUI();
  });
  
  // Set leaderboard initial values
  document.getElementById('leaderboard-user-avatar').src = state.user.avatarUrl;
  document.getElementById('leaderboard-user-name').textContent = state.user.fullName;
  document.getElementById('leaderboard-user-xp').textContent = `${state.gamification.xp} XP`;
}
