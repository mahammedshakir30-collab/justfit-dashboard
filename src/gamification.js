// FitAI Gamification, Streak, and Achievement Manager
import gsap from 'gsap';

export function checkAndTriggerAchievements(state, notifyCallback) {
  let unlockedCount = 0;
  
  // 1. Water Achievement
  const waterAch = state.achievements.find(a => a.id === "hydro_hero");
  if (waterAch && !waterAch.unlocked && state.daily.waterIntakeMl >= 2500) {
    waterAch.unlocked = true;
    waterAch.date = new Date().toISOString().split('T')[0];
    unlockedCount++;
    triggerCelebration("Achievement Unlocked!", "Hydro Hero: Drank 2.5L or more of water today!", "droplet");
    if (notifyCallback) notifyCallback(`🏆 Achievement Unlocked: Hydro Hero!`);
  }

  // 2. Step Goal Achievement
  const stepAch = state.achievements.find(a => a.id === "steps_master"); // Note: we can add this or check macro_master
  const macroAch = state.achievements.find(a => a.id === "macro_master");
  // Let's add standard notification triggers.
  
  return unlockedCount > 0;
}

export function triggerCelebration(title, subtitle, iconName = "award") {
  // Create Canvas or Dom overlay for celebration
  const overlay = document.createElement("div");
  overlay.className = "celebration-overlay";
  overlay.innerHTML = `
    <div class="celebration-card">
      <div class="celebration-glow"></div>
      <div class="celebration-icon-wrapper">
        <i data-lucide="${iconName}" class="celebration-icon"></i>
      </div>
      <h2 class="celebration-title">${title}</h2>
      <p class="celebration-subtitle">${subtitle}</p>
      <div class="celebration-xp-pill">+100 XP</div>
      <button class="celebration-btn">Awesome!</button>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Initialize Lucide icons inside overlay
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { class: 'lucide-icon' },
      nameAttr: 'data-lucide'
    });
  }

  // Generate particles
  const card = overlay.querySelector('.celebration-card');
  const btn = overlay.querySelector('.celebration-btn');
  
  // Particle explosion
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'celebration-particle';
    // Random colors (Fit Green, Light Green, White, Orange)
    const colors = ['#A1FA0A', '#CFED89', '#FEF9F5', '#f59e0b'];
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = '50%';
    p.style.top = '50%';
    overlay.appendChild(p);
    
    // Animate particle out
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 200;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    gsap.to(p, {
      x: x,
      y: y,
      scale: 0,
      opacity: 0,
      duration: 1.5 + Math.random(),
      ease: "power2.out",
      onComplete: () => p.remove()
    });
  }

  // GSAP animation for the card
  gsap.fromTo(card, 
    { scale: 0.7, opacity: 0, y: 50 },
    { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
  );

  // Background overlay fade in
  gsap.fromTo(overlay,
    { backgroundColor: "rgba(0, 0, 0, 0)" },
    { backgroundColor: "rgba(3, 7, 18, 0.85)", duration: 0.4 }
  );

  const dismiss = () => {
    gsap.to(card, {
      scale: 0.8,
      opacity: 0,
      y: 30,
      duration: 0.3,
      onComplete: () => {
        overlay.remove();
      }
    });
  };

  btn.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss();
  });
}
