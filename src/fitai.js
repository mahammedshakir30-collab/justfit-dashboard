// justfit - AI Coach Chat Processing Module

export function getJustFitResponse(state, message) {
  const query = message.toLowerCase().trim();
  
  // Calculate current BMI
  const weight = state.user.weightKg;
  const height = state.user.heightCm;
  const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
  
  let bmiCategory = "Normal weight";
  let bmiAdvice = "You're in a great place. Keep maintaining a balanced diet and regular resistance/cardio training.";
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiAdvice = "We recommend a slight caloric surplus, focusing on complex carbohydrates, lean proteins, and progressive overload in strength training.";
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = "Overweight";
    bmiAdvice = "Consider a moderate caloric deficit (250-500 kcal below maintenance) paired with active cardiovascular exercise and strength work to maintain lean mass.";
  } else if (bmi >= 30) {
    bmiCategory = "Obese";
    bmiAdvice = "We recommend focusing on daily active steps, portion control, staying hydrated, and checking in with a physician to build a low-impact exercise roadmap.";
  }

  // 1. "Explain my BMI"
  if (query.includes("bmi") || query.includes("body mass index")) {
    return `### 📊 Your Personal BMI Analysis

Your current metrics:
* **Height**: ${height} cm
* **Weight**: ${weight} kg
* **Calculated BMI**: **${bmi}**

#### Classification: **${bmiCategory}**

**Coach Recommendation:**
${bmiAdvice}

*Note: BMI is a general screening index. It does not account for muscle mass versus fat distribution. If you have significant muscle mass, your percentage body fat may actually be in a highly athletic range.*`;
  }

  // 2. "Generate today's workout" or "workout"
  if (query.includes("workout") || query.includes("exercise") || query.includes("routine") || query.includes("training")) {
    const goal = state.user.healthGoal;
    if (goal === "muscle_gain") {
      return `### 🏋️ Today's Strength & Hypertrophy Routine

Since your goal is **Muscle Gain**, we will focus on progressive overload and heavy resistance:

| Exercise | Sets | Reps | Rest | Focus |
|---|---|---|---|---|
| **Barbell Squats** | 4 | 6-8 | 120s | Deep range of motion |
| **Dumbbell Bench Press** | 4 | 8-10 | 90s | Controlled negatives |
| **Lat Pulldowns** | 3 | 10-12 | 75s | Squeeze at the bottom |
| **Romanian Deadlifts** | 3 | 10-12 | 90s | Hamstring stretch |
| **Cable Lateral Raises** | 3 | 12-15 | 60s | Deltoid activation |

*🔥 **Warm Up**: 5-10 mins light walk/jog + dynamic stretching.  
🎯 **Coach Tip**: Log this workout in the **Fitness** tab afterwards to gain **70 XP** and update your daily stats!*`;
    } else {
      return `### 🏃 Today's Fat Loss & Conditioning Workout

Since your goal is **Weight Loss / General Fitness**, we will focus on high energy expenditure:

**HIIT Circuit (Repeat 4 times):**
1. **Goblet Squats** — 45 sec work / 15 sec rest
2. **Kettlebell Swings** — 45 sec work / 15 sec rest
3. **Dumbbell Row to Pushup** — 45 sec work / 15 sec rest
4. **Burpees (or mountain climbers)** — 45 sec work / 15 sec rest
5. **Plank Hold** — 60 sec work

*⏱ **Rest**: 90 seconds between rounds.  
🎯 **Coach Tip**: Keep your heart rate in the fat-burn zone (125-145 BPM). Log this in the **Fitness** tab to claim your **60 XP**!*`;
    }
  }

  // 3. "What should I eat" or "diet advice" or "post exercise" or "snack"
  if (query.includes("eat") || query.includes("diet") || query.includes("post-workout") || query.includes("nutrition") || query.includes("food") || query.includes("protein")) {
    return `### 🍎 Post-Workout Recovery Nutrition

To optimize protein synthesis and replenish glycogen storage, target a **3:1 or 2:1 Carb-to-Protein ratio** within 45 minutes of finishing your workout:

#### Recommended Options:
1. **The Pro Shake**: 1 scoop Whey Protein, 1 banana, 250ml Almond milk, 15g Peanut Butter. *(380 kcal, 30g Protein, 40g Carbs, 10g Fat)*
2. **Savoury Quick Option**: 150g Grilled Chicken breast with 100g Jasmine rice and steamed broccoli. *(420 kcal, 45g Protein, 38g Carbs, 4g Fat)*
3. **Plant-Based Recovery**: 150g Tempeh stir-fry with mixed vegetables and quinoa. *(390 kcal, 24g Protein, 45g Carbs, 12g Fat)*

*💡 **Hydration Rule**: Drink at least 500ml of water with your meal. You have logged **${state.daily.waterIntakeMl} ml** of water today (Goal: ${state.daily.waterGoalMl} ml).*`;
  }

  // 4. "Create a meal plan" or "meal plan"
  if (query.includes("meal plan") || query.includes("recipe") || query.includes("breakfast") || query.includes("lunch") || query.includes("dinner")) {
    return `### 📅 justfit Custom Daily Meal Plan (Target: ~2,000 kcal)

Here is a structured meal plan designed to keep your macros balanced:

*   **🌅 Breakfast (08:00 AM)**: 
    *   3 Scrambled Eggs + 2 slices of Whole-Wheat Toast + 1/2 Avocado.
    *   *Macros: 520 kcal | 26g Protein | 34g Carbs | 28g Fat*
*   **☀️ Lunch (01:00 PM)**:
    *   180g Baked Salmon + 150g Sweet Potato + Asparagus with olive oil.
    *   *Macros: 580 kcal | 40g Protein | 42g Carbs | 22g Fat*
*   **🌆 Snack (04:30 PM)**:
    *   200g Low-Fat Greek Yogurt + Handful of Blueberries + 1 tbsp Chia Seeds.
    *   *Macros: 240 kcal | 20g Protein | 25g Carbs | 6g Fat*
*   **🌙 Dinner (07:30 PM)**:
    *   150g Lean Turkey Breast Mince + 100g Brown Rice + Mixed stir-fry vegetables.
    *   *Macros: 490 kcal | 38g Protein | 48g Carbs | 12g Fat*

*      **Daily Total**: 1,830 kcal | 124g Protein | 149g Carbs | 68g Fat.  
💡 You can easily add items to your day using the **Nutrition** meal logger!*`;
  }

  // 5. "Help me lose belly fat" or "belly fat" or "lose fat"
  if (query.includes("belly fat") || query.includes("lose fat") || query.includes("lose weight") || query.includes("deficit")) {
    return `### 🔥 Scientifically-Backed Fat Loss Protocol

Losing belly fat requires a systemic approach, as spot-reduction is a myth. To reduce visceral adiposity, follow this 4-step framework:

1.  **Maintain a Caloric Deficit**: Eat roughly 300-500 kcal below your Total Daily Energy Expenditure (TDEE).
2.  **Elevate NEAT (Non-Exercise Activity Thermogenesis)**: Focus on hitting at least **10,000 steps daily**. You are currently at **${state.daily.steps} steps** today.
3.  **Prioritize Protein**: Consume 1.6-2.2g of protein per kg of bodyweight to preserve lean muscle while burning fat.
4.  **Optimize Sleep**: Under 7 hours of sleep increases cortisol (stress hormone), which promotes abdominal fat storage. Your sleep is currently averaging **${state.daily.sleepDurationHours} hours** (Sleep Score: ${state.daily.sleepScore}/100), which is excellent.

*      **justfit Quote**: "Consistency beats intensity every time." Focus on small daily habits!*`;
  }

  // 6. Default response
  return `### 👋 Hello! I am justfit, your Health & Wellness Coach.

I've analyzed your current profile:
*   **BMI**: ${bmi} (${bmiCategory})
*   **Streak**: ${state.gamification.currentStreak} Days 🔥
*   **Daily Target**: Steps (${state.daily.steps}/${state.daily.stepsGoal}), Water (${state.daily.waterIntakeMl}/${state.daily.waterGoalMl}ml)

How can I assist you further? Try asking me:
*   "Explain my BMI"
*   "Generate today's workout"
*   "What should I eat after exercise?"
*   "Help me lose belly fat"
*   "Create a meal plan"`;
}
