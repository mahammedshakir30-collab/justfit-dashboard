// FitAI Local Database and State Management

const DEFAULT_STATE = {
  user: {
    email: "admin@justfit.com",
    fullName: "Alex Rivera",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    heightCm: 178,
    weightKg: 76.5,
    birthDate: "1995-04-12",
    gender: "male",
    healthGoal: "muscle_gain"
  },
  gamification: {
    xp: 380,
    level: 2,
    coins: 240,
    currentStreak: 5,
    lastActiveDate: new Date().toISOString().split('T')[0]
  },
  daily: {
    steps: 6420,
    stepsGoal: 10000,
    distanceKm: 4.82,
    caloriesBurned: 450,
    caloriesBurnedGoal: 700,
    waterIntakeMl: 1200,
    waterGoalMl: 2500,
    sleepDurationHours: 7.8,
    sleepScore: 82,
    heartRateBpm: 72,
    bloodPressureSystolic: 118,
    bloodPressureDiastolic: 76,
    bloodOxygenSpO2: 98,
    bloodSugarMgDl: 95,
    stressLevel: 3,
    mood: "good",
    macros: {
      proteinG: 65,
      carbsG: 180,
      fatG: 45,
      proteinGoal: 150,
      carbsGoal: 220,
      fatGoal: 70,
      caloriesConsumed: 1385,
      caloriesGoal: 2110
    }
  },
  meals: [
    { id: 1, type: "breakfast", name: "Avocado Toast & Egg", calories: 420, protein: 18, carbs: 32, fat: 22 },
    { id: 2, type: "lunch", name: "Grilled Chicken Salad", calories: 510, protein: 42, carbs: 20, fat: 15 },
    { id: 3, type: "snack", name: "Greek Yogurt with Berries", calories: 220, protein: 15, carbs: 18, fat: 3 },
    { id: 4, type: "breakfast", name: "Protein Shake", calories: 235, protein: 30, carbs: 10, fat: 5 }
  ],
  workouts: [
    { id: 1, type: "Running", duration: 30, distance: 4.2, calories: 340, avgHeartRate: 145, time: "08:15 AM", date: new Date().toISOString().split('T')[0] },
    { id: 2, type: "Yoga", duration: 20, distance: 0, calories: 110, avgHeartRate: 105, time: "11:30 AM", date: new Date().toISOString().split('T')[0] }
  ],
  sleepPhases: {
    deep: 1.8,
    rem: 1.4,
    light: 4.6
  },
  history: {
    steps: [7200, 8500, 10200, 9800, 6100, 9400, 6420],
    caloriesBurned: [480, 580, 710, 640, 420, 620, 450],
    water: [2000, 2500, 2400, 1800, 2200, 2500, 1200],
    sleep: [7.2, 7.8, 8.1, 6.9, 7.5, 8.0, 7.8],
    sleepScores: [75, 84, 88, 70, 78, 85, 82],
    dates: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Today"],
    heartRateToday: [
      { time: "08:00", bpm: 65 },
      { time: "09:00", bpm: 120 },
      { time: "10:00", bpm: 95 },
      { time: "12:00", bpm: 72 },
      { time: "14:00", bpm: 70 },
      { time: "16:00", bpm: 115 },
      { time: "18:00", bpm: 85 },
      { time: "20:00", bpm: 72 }
    ]
  },
  challenges: [
    { id: "water_warrior", name: "Water Warrior", desc: "Drink 2.5L of water daily", current: 5, target: 7, xp: 100, reward: "Hydro Badge", status: "active" },
    { id: "step_up", name: "Peak Walker", desc: "Reach 10,000 steps daily", current: 3, target: 7, xp: 150, reward: "Walker Badge", status: "active" },
    { id: "zen_master", name: "Mindfulness Master", desc: "Complete 10 mins meditation daily", current: 7, target: 7, xp: 200, reward: "Zen Badge", status: "completed" },
    { id: "run_club", name: "Speed Demon", desc: "Run a total of 15km in a week", current: 4.2, target: 15, xp: 300, reward: "Speedster Badge", status: "active" }
  ],
  achievements: [
    { id: "first_workout", name: "First Step", desc: "Complete your first logged workout", icon: "award", xp: 50, unlocked: true, date: "2026-07-09" },
    { id: "streak_5", name: "Consistency King", desc: "Maintain a 5-day active streak", icon: "flame", xp: 100, unlocked: true, date: "2026-07-13" },
    { id: "macro_master", name: "Macro Genius", desc: "Hit all your macros within 5% of your daily goal", icon: "pie-chart", xp: 150, unlocked: false, date: "" },
    { id: "sleep_pro", name: "Deep Sleeper", desc: "Get over 2 hours of deep sleep in a single night", icon: "moon", xp: 120, unlocked: false, date: "" }
  ],
  notifications: [
    { id: 1, type: "streak", message: "🔥 Streak Alert! You've logged active metrics 5 days in a row.", isRead: false, time: "2 hours ago" },
    { id: 2, type: "level", message: "🎉 Congratulations! You leveled up to Level 2.", isRead: true, time: "1 day ago" },
    { id: 3, type: "welcome", message: "🚀 Welcome to justfit! Customize your targets in Settings.", isRead: true, time: "4 days ago" }
  ],
  aiChatHistory: [
    { role: "assistant", content: "Hello! I am justfit, your personal health and fitness coach. Ask me anything about home workouts, diet plans, BMI analysis, or weight loss! How can I help you today?" }
  ]
};

const STORAGE_KEY = "justfit_state";

export function getAppState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse app state", e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

export function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAppState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export function addXP(state, amount) {
  state.gamification.xp += amount;
  const currentXP = state.gamification.xp;
  const currentLevel = state.gamification.level;
  const xpNeeded = currentLevel * 500; // Level 1 -> 500 XP, Level 2 -> 1000 XP etc.
  
  let leveledUp = false;
  if (currentXP >= xpNeeded) {
    state.gamification.level += 1;
    state.gamification.coins += 50; // Bonus coins on level up
    leveledUp = true;
    
    // Add level up notification
    state.notifications.unshift({
      id: Date.now(),
      type: "level",
      message: `🎉 LEVEL UP! You reached Level ${state.gamification.level}! Received 50 bonus coins.`,
      isRead: false,
      time: "Just now"
    });
  }
  
  saveAppState(state);
  return leveledUp;
}

export function logWater(state, amountMl) {
  state.daily.waterIntakeMl += amountMl;
  
  // Progress active water challenges
  const waterChallenge = state.challenges.find(c => c.id === "water_warrior");
  if (waterChallenge && waterChallenge.status === "active") {
    if (state.daily.waterIntakeMl >= state.daily.waterGoalMl) {
      // Let's assume daily completion of goal
      // For mock purposes, increment challenge tracker if water goal just met
      if (state.daily.waterIntakeMl - amountMl < state.daily.waterGoalMl) {
        waterChallenge.current = Math.min(waterChallenge.target, waterChallenge.current + 1);
        if (waterChallenge.current === waterChallenge.target) {
          waterChallenge.status = "completed";
          addXP(state, waterChallenge.xp);
          state.gamification.coins += 30;
          state.notifications.unshift({
            id: Date.now(),
            type: "challenge",
            message: `🏆 Challenge Completed: Water Warrior! Earned ${waterChallenge.xp} XP & 30 Coins.`,
            isRead: false,
            time: "Just now"
          });
        }
      }
    }
  }
  
  saveAppState(state);
}

export function logMeal(state, mealType, foodName, calories, protein, carbs, fat) {
  const newMeal = {
    id: Date.now(),
    type: mealType,
    name: foodName,
    calories: parseInt(calories) || 0,
    protein: parseInt(protein) || 0,
    carbs: parseInt(carbs) || 0,
    fat: parseInt(fat) || 0
  };
  
  state.meals.push(newMeal);
  
  // Update daily macro totals
  state.daily.macros.caloriesConsumed += newMeal.calories;
  state.daily.macros.proteinG += newMeal.protein;
  state.daily.macros.carbsG += newMeal.carbs;
  state.daily.macros.fatG += newMeal.fat;
  
  // Trigger macro master achievement check if targets met
  const macros = state.daily.macros;
  const pDiff = Math.abs(macros.proteinG - macros.proteinGoal) / macros.proteinGoal;
  const cDiff = Math.abs(macros.carbsG - macros.carbsGoal) / macros.carbsGoal;
  const fDiff = Math.abs(macros.fatG - macros.fatGoal) / macros.fatGoal;
  
  const achievement = state.achievements.find(a => a.id === "macro_master");
  if (achievement && !achievement.unlocked && pDiff <= 0.05 && cDiff <= 0.05 && fDiff <= 0.05) {
    achievement.unlocked = true;
    achievement.date = new Date().toISOString().split('T')[0];
    addXP(state, achievement.xp);
    state.notifications.unshift({
      id: Date.now(),
      type: "achievement",
      message: `🏆 Achievement Unlocked: Macro Genius! Earned ${achievement.xp} XP.`,
      isRead: false,
      time: "Just now"
    });
  }
  
  addXP(state, 15); // Log meal awards 15 XP
  saveAppState(state);
  return newMeal;
}

export function logWorkout(state, type, duration, distance, calories) {
  const durationNum = parseInt(duration) || 0;
  const distanceNum = parseFloat(distance) || 0;
  const caloriesNum = parseInt(calories) || 0;
  
  const newWorkout = {
    id: Date.now(),
    type: type,
    duration: durationNum,
    distance: distanceNum,
    calories: caloriesNum,
    avgHeartRate: 110 + Math.floor(Math.random() * 40),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toISOString().split('T')[0]
  };
  
  state.workouts.unshift(newWorkout);
  
  // Update daily totals
  state.daily.caloriesBurned += caloriesNum;
  state.daily.steps += Math.floor(durationNum * 120); // roughly 120 steps/min for general workout
  state.daily.distanceKm = parseFloat((state.daily.distanceKm + (distanceNum || (durationNum * 0.08))).toFixed(2));
  
  // Update challenges
  const runChallenge = state.challenges.find(c => c.id === "run_club");
  if (runChallenge && runChallenge.status === "active" && (type.toLowerCase() === "running" || type.toLowerCase() === "walking")) {
    runChallenge.current = parseFloat((runChallenge.current + distanceNum).toFixed(1));
    if (runChallenge.current >= runChallenge.target) {
      runChallenge.status = "completed";
      addXP(state, runChallenge.xp);
      state.gamification.coins += 50;
      state.notifications.unshift({
        id: Date.now(),
        type: "challenge",
        message: `🏆 Challenge Completed: Speed Demon! Earned ${runChallenge.xp} XP & 50 Coins.`,
        isRead: false,
        time: "Just now"
      });
    }
  }
  
  // Check first workout achievement
  const workoutAch = state.achievements.find(a => a.id === "first_workout");
  if (workoutAch && !workoutAch.unlocked) {
    workoutAch.unlocked = true;
    workoutAch.date = new Date().toISOString().split('T')[0];
    addXP(state, workoutAch.xp);
  }
  
  addXP(state, Math.floor(caloriesNum / 10)); // Reward 1 XP per 10 calories burned
  saveAppState(state);
  return newWorkout;
}
