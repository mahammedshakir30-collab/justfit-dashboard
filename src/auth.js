// FitAI Authentication & Onboarding Router
import gsap from 'gsap';
import { saveAppState, getAppState } from './data';

export function initAuth(onLoginSuccess) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const toggleToSignup = document.getElementById('toggle-to-signup');
  const toggleToLogin = document.getElementById('toggle-to-login');
  
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');
  
  const loginSection = document.getElementById('login-section');
  const signupSection = document.getElementById('signup-section');

  // Check if session exists
  const activeSession = localStorage.getItem('justfit_session');
  if (activeSession) {
    // Session exists, transition to main dashboard
    authContainer.style.display = 'none';
    appContainer.style.display = 'grid';
    appContainer.style.opacity = '1';
    if (onLoginSuccess) onLoginSuccess(JSON.parse(activeSession));
    return;
  }

  // Set up view toggle animations
  toggleToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    gsap.to(loginSection, {
      opacity: 0,
      x: -30,
      duration: 0.3,
      onComplete: () => {
        loginSection.style.display = 'none';
        signupSection.style.display = 'block';
        gsap.fromTo(signupSection, 
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      }
    });
  });

  toggleToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    gsap.to(signupSection, {
      opacity: 0,
      x: 30,
      duration: 0.3,
      onComplete: () => {
        signupSection.style.display = 'none';
        loginSection.style.display = 'block';
        gsap.fromTo(loginSection, 
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      }
    });
  });

  // Handle Login Submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    if (!email || !password) {
      showError(errorMsg, "Please fill in all fields.");
      return;
    }

    // Accept any password for mock demo, but email must look valid
    if (!validateEmail(email)) {
      showError(errorMsg, "Please enter a valid email address.");
      return;
    }

    // Success! Save session
    const sessionUser = {
      email: email,
      fullName: email.split('@')[0].toUpperCase(),
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
    };

    // Update state to use custom logged-in user
    const state = getAppState();
    state.user.email = sessionUser.email;
    state.user.fullName = sessionUser.fullName;
    state.user.avatarUrl = sessionUser.avatarUrl;
    saveAppState(state);

    triggerLoginTransition(sessionUser, onLoginSuccess);
  });

  // Handle Signup & Onboarding Submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const fullName = document.getElementById('signup-name').value;
    const height = parseFloat(document.getElementById('signup-height').value);
    const weight = parseFloat(document.getElementById('signup-weight').value);
    const goal = document.getElementById('signup-goal').value;
    const errorMsg = document.getElementById('signup-error');

    if (!email || !fullName || !height || !weight || !goal) {
      showError(errorMsg, "Please fill in all onboarding fields.");
      return;
    }

    if (!validateEmail(email)) {
      showError(errorMsg, "Please enter a valid email address.");
      return;
    }

    // Initialize custom user profile
    const sessionUser = {
      email,
      fullName,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`
    };

    const state = getAppState();
    state.user.email = email;
    state.user.fullName = fullName;
    state.user.avatarUrl = sessionUser.avatarUrl;
    state.user.heightCm = height;
    state.user.weightKg = weight;
    state.user.healthGoal = goal;
    
    // Recalculate BMI in daily stats
    const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
    state.daily.bloodSugarMgDl = 92;
    state.daily.heartRateBpm = 68;
    
    // Set custom goals based on targets
    if (goal === "weight_loss") {
      state.daily.caloriesBurnedGoal = 800;
      state.daily.macros.caloriesGoal = 1800;
      state.daily.macros.proteinGoal = 140;
      state.daily.macros.carbsGoal = 180;
      state.daily.macros.fatGoal = 55;
    } else if (goal === "muscle_gain") {
      state.daily.caloriesBurnedGoal = 600;
      state.daily.macros.caloriesGoal = 2600;
      state.daily.macros.proteinGoal = 180;
      state.daily.macros.carbsGoal = 290;
      state.daily.macros.fatGoal = 80;
    }

    saveAppState(state);
    triggerLoginTransition(sessionUser, onLoginSuccess);
  });
}

function triggerLoginTransition(sessionUser, onLoginSuccess) {
  localStorage.setItem('justfit_session', JSON.stringify(sessionUser));

  // Premium screen-wipe transition
  const wipe = document.createElement('div');
  wipe.className = 'screen-transition-wipe';
  document.body.appendChild(wipe);

  // GSAP slide wipe up and reveal dashboard
  gsap.timeline()
    .to(wipe, {
      top: 0,
      duration: 0.6,
      ease: "power3.inOut"
    })
    .call(() => {
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('app-container').style.display = 'grid';
      if (onLoginSuccess) onLoginSuccess(sessionUser);
    })
    .to(wipe, {
      top: "-100%",
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: () => wipe.remove()
    })
    .fromTo('#app-container',
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
    );
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.opacity = 1;
  gsap.fromTo(el, 
    { x: -10 },
    { x: 0, duration: 0.3, ease: "rough" }
  );
  setTimeout(() => {
    gsap.to(el, { opacity: 0, duration: 0.5 });
  }, 4000);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function logout() {
  localStorage.removeItem('justfit_session');
  location.reload();
}
