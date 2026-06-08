/**
 * Resilience Recharge - Core Application Logic
 * Touch-optimized for iPad, powered by Web Audio API & HTML5 Canvas Particles.
 */

// --- Constants & Config ---
const GAME_DURATION = 60; // 60-second limit

// Element templates to spawn
const WELLNESS_ITEMS = [
  { label: 'Exercise', icon: 'exercise', score: 50, type: 'positive' },
  { label: 'Meditation', icon: 'meditation', score: 50, type: 'positive' },
  { label: 'Balanced Diet', icon: 'balanced-diet', score: 50, type: 'positive' },
  { label: 'Sleep', icon: 'sleep', score: 50, type: 'positive' },
  { label: 'Hydration', icon: 'hydration', score: 50, type: 'positive' }
];

const STRESSOR_ITEMS = [
  { label: 'Stress', icon: 'stress', score: -30, type: 'negative' },
  { label: 'Long Hours', icon: 'long-hours', score: -30, type: 'negative' },
  { label: 'Short Sleep', icon: 'short-sleep', score: -30, type: 'negative' },
  { label: 'Junk Food', icon: 'junk-food', score: -30, type: 'negative' },
  { label: 'Cigarette', icon: 'cigarette', score: -30, type: 'negative' }
];

// --- Audio Synthesizer Class (Web Audio API) ---
class AudioSynth {
  constructor() {
    this.ctx = null;
  }

  // Lazy initialize AudioContext on user gesture (Safari compliance)
  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  playChime() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Pleasant C5 -> G5 -> C6 sweep
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12);
    
    osc2.frequency.setValueAtTime(783.99, now);
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12);

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playBuzz() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // Dissonant low frequency alarm tones
    osc1.frequency.setValueAtTime(130.81, now); // C3
    osc1.frequency.linearRampToValueAtTime(82.41, now + 0.22); // E2
    
    osc2.frequency.setValueAtTime(138.59, now); // C#3 (dissonant semitone)
    osc2.frequency.linearRampToValueAtTime(87.31, now + 0.22); // F2

    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.linearRampToValueAtTime(0.001, now + 0.24);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  playTick() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    
    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playFanfare(score) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    gainNode.connect(this.ctx.destination);

    const playNote = (freq, startOffset, duration, type = 'sine') => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + startOffset);
      
      oscGain.gain.setValueAtTime(0.12, now + startOffset);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    if (score >= 400) {
      // Ascending grand major fanfare
      playNote(261.63, 0.0, 0.15, 'triangle');  // C4
      playNote(329.63, 0.15, 0.15, 'triangle'); // E4
      playNote(392.00, 0.30, 0.15, 'triangle'); // G4
      playNote(523.25, 0.45, 0.6, 'sine');      // C5
      playNote(659.25, 0.45, 0.6, 'sine');      // E5
    } else if (score >= 200) {
      // Pleasant resolving triad
      playNote(329.63, 0.0, 0.2); // E4
      playNote(392.00, 0.1, 0.2); // G4
      playNote(523.25, 0.2, 0.5); // C5
    } else if (score >= 0) {
      // Calm, neutral resolution
      playNote(293.66, 0.0, 0.2); // D4
      playNote(440.00, 0.15, 0.4); // A4
    } else {
      // Melancholic drop representing burnout warning
      playNote(220.00, 0.0, 0.3, 'sawtooth'); // A3
      playNote(233.08, 0.2, 0.3, 'sawtooth'); // Bb3 (dissonance)
      playNote(196.00, 0.4, 0.6, 'square');   // G3
    }
  }
}

const audio = new AudioSynth();

// --- Game State Manager ---
const state = {
  // Doctor Info
  doctorName: '',
  
  // Game Play details
  score: 0,
  timeLeft: GAME_DURATION,
  isPlaying: false,
  
  // Physics tracking arrays
  items: [],
  particles: [],
  
  // Spawners and loops
  gameLoopId: null,
  timerIntervalId: null,
  lastTime: 0,
  spawnAccumulator: 0,
  
  // Analytics
  statWellnessTapped: 0,
  statStressorsTapped: 0
};

// --- DOM Cache ---
const elements = {
  // Screens
  container: document.getElementById('app-container'),
  welcome: document.getElementById('screen-welcome'),
  tutorial: document.getElementById('screen-tutorial'),
  game: document.getElementById('screen-game'),
  gameover: document.getElementById('screen-gameover'),
  
  // Interactive Controls
  formReg: document.getElementById('form-registration'),
  inputName: document.getElementById('doctor-name'),
  btnSubmitName: document.getElementById('btn-submit-name'),
  btnStartGame: document.getElementById('btn-start-game'),
  btnRestartGame: document.getElementById('btn-restart-game'),
  
  // HUD Elements
  hudName: document.getElementById('hud-doctor-name'),
  hudTimerText: document.getElementById('hud-timer-text'),
  hudTimerBar: document.getElementById('hud-timer-bar'),
  hudScore: document.getElementById('hud-score-value'),
  playfield: document.getElementById('game-playfield'),
  fxCanvas: document.getElementById('game-fx-canvas'),
  
  // Summary Elements
  tutorialGreeting: document.getElementById('tutorial-greeting'),
  gameoverGreeting: document.getElementById('gameover-greeting'),
  gameoverScore: document.getElementById('gameover-score'),
  statWellness: document.getElementById('stat-wellness-tapped'),
  statStressors: document.getElementById('stat-stressors-tapped'),
  badgeCard: document.getElementById('badge-card'),
  badgeTitle: document.getElementById('badge-title'),
  badgeDesc: document.getElementById('badge-desc'),
  badgeSvg: document.getElementById('badge-svg')
};

// Canvas 2D context setup
const ctx = elements.fxCanvas.getContext('2d');

// --- Screen Switching Controller ---
function showScreen(targetScreen) {
  const allScreens = [elements.welcome, elements.tutorial, elements.game, elements.gameover];
  allScreens.forEach(screen => {
    screen.classList.remove('active');
  });
  targetScreen.classList.add('active');
  
  // Adjust sizing if game or gameover screens are loaded
  if (targetScreen === elements.game) {
    resizeCanvas();
  }
}

// --- Responsive Canvas Handling ---
function resizeCanvas() {
  const rect = elements.playfield.getBoundingClientRect();
  elements.fxCanvas.width = rect.width;
  elements.fxCanvas.height = rect.height;
}
window.addEventListener('resize', () => {
  if (state.isPlaying) {
    resizeCanvas();
  }
});

// --- User Registration Submit Handler ---
elements.formReg.addEventListener('submit', (e) => {
  e.preventDefault();
  let nameVal = elements.inputName.value.trim();
  if (!nameVal) return;
  
  // Format the name nicely
  state.doctorName = nameVal;
  
  // Pre-initialize audio under gesture rule
  audio.init();
  
  // Update UI strings
  elements.tutorialGreeting.innerText = `Welcome, Dr. ${state.doctorName}!`;
  
  showScreen(elements.tutorial);
});

// --- Starting & Initializing Game Play ---
elements.btnStartGame.addEventListener('click', () => {
  audio.init();
  startNewChallenge();
});

elements.btnRestartGame.addEventListener('click', () => {
  audio.init();
  showScreen(elements.tutorial);
});

function startNewChallenge() {
  // Clean elements from old run
  elements.playfield.querySelectorAll('.game-item, .floating-score').forEach(el => el.remove());
  
  // Reset states
  state.score = 0;
  state.timeLeft = GAME_DURATION;
  state.isPlaying = true;
  state.items = [];
  state.particles = [];
  state.lastTime = 0;
  state.spawnAccumulator = 0;
  state.statWellnessTapped = 0;
  state.statStressorsTapped = 0;
  
  // Update HUD
  elements.hudName.innerText = `Dr. ${state.doctorName}`;
  elements.hudScore.innerText = '0';
  elements.hudScore.className = 'hud-value numeric';
  updateHUDTimer();
  
  // Shift to game view
  showScreen(elements.game);
  
  // Set intervals
  startCountdownTimer();
  
  // Kickstart loop
  state.gameLoopId = requestAnimationFrame(gameLoop);
}

// --- 60s Countdown Timer Controller ---
function startCountdownTimer() {
  if (state.timerIntervalId) clearInterval(state.timerIntervalId);
  
  state.timerIntervalId = setInterval(() => {
    if (!state.isPlaying) return;
    
    state.timeLeft--;
    updateHUDTimer();
    
    // Low time audio cues
    if (state.timeLeft <= 10 && state.timeLeft > 0) {
      audio.playTick();
    }
    
    if (state.timeLeft <= 0) {
      endGameChallenge();
    }
  }, 1000);
}

function updateHUDTimer() {
  elements.hudTimerText.innerText = `${state.timeLeft}s`;
  
  const percentage = (state.timeLeft / GAME_DURATION) * 100;
  elements.hudTimerBar.style.width = `${percentage}%`;
  
  // Dynamic warning bar coloring
  elements.hudTimerBar.className = 'progress-bar-fill';
  if (state.timeLeft <= 20 && state.timeLeft > 10) {
    elements.hudTimerBar.classList.add('warning');
  } else if (state.timeLeft <= 10) {
    elements.hudTimerBar.classList.add('danger');
  }
}

// --- Terminating Game Challenge ---
function endGameChallenge() {
  state.isPlaying = false;
  clearInterval(state.timerIntervalId);
  cancelAnimationFrame(state.gameLoopId);
  
  // Clear lingering falling elements
  elements.playfield.querySelectorAll('.game-item').forEach(el => el.remove());
  
  // Set up evaluation screen values
  elements.gameoverGreeting.innerText = `Dr. ${state.doctorName}'s Resilience Report`;
  elements.statWellness.innerText = state.statWellnessTapped;
  elements.statStressors.innerText = state.statStressorsTapped;
  
  // Setup Badge allocation
  allocateResilienceBadge(state.score);
  
  // Render Game Over view
  showScreen(elements.gameover);
  
  // Play achievement tone
  audio.playFanfare(state.score);
  
  // Animate final score roll
  animateScoreCounter(state.score);
}

// --- Final Score Roll Animation ---
function animateScoreCounter(targetScore) {
  let currentVal = 0;
  const duration = 1200; // ms
  const startTime = performance.now();
  
  function updateVal(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Quadratic easeOut logic
    const easeProgress = progress * (2 - progress);
    currentVal = Math.round(easeProgress * targetScore);
    
    elements.gameoverScore.innerText = currentVal;
    
    if (progress < 1) {
      requestAnimationFrame(updateVal);
    } else {
      elements.gameoverScore.innerText = targetScore;
    }
  }
  requestAnimationFrame(updateVal);
}

// --- Resilience Evaluation Badge system ---
function allocateResilienceBadge(score) {
  // Clean old styling
  elements.badgeCard.className = 'badge-display';
  
  if (score >= 400) {
    elements.badgeCard.classList.add('badge-supercharged');
    elements.badgeTitle.innerText = 'Supercharged Physician';
    elements.badgeDesc.innerText = 'Outstanding cognitive focus and stress management. Exceptional lifestyle defenses against professional burnout.';
    elements.badgeSvg.querySelector('use').setAttribute('href', '#icon-heartbeat');
  } else if (score >= 200) {
    elements.badgeCard.classList.add('badge-balanced');
    elements.badgeTitle.innerText = 'Resilient Practitioner';
    elements.badgeDesc.innerText = 'Healthy balance of positive habits. Successfully deflecting stressors under active ward pressures.';
    elements.badgeSvg.querySelector('use').setAttribute('href', '#icon-meditation');
  } else if (score >= 0) {
    elements.badgeCard.classList.add('badge-fatigued');
    elements.badgeTitle.innerText = 'Fatigued Practitioner';
    elements.badgeDesc.innerText = 'Coping under pressure, but wellness habits are getting squeezed. Prioritize sleep and balanced hydration.';
    elements.badgeSvg.querySelector('use').setAttribute('href', '#icon-short-sleep');
  } else {
    elements.badgeCard.classList.add('badge-burnout');
    elements.badgeTitle.innerText = 'Burnout Risk Alert';
    elements.badgeDesc.innerText = 'Critical stress and fatigue load detected. It is time to delegate tasks, step back, and schedule immediate wellness recharge.';
    elements.badgeSvg.querySelector('use').setAttribute('href', '#icon-stress');
  }
}

// --- Spawning Elements Mechanics ---
function getSpawnInterval() {
  const elapsed = GAME_DURATION - state.timeLeft;
  const progress = elapsed / GAME_DURATION; // 0 to 1
  
  // Accelerate spawning as time runs out (1200ms -> 450ms)
  return 1200 - (progress * 750);
}

function spawnItem() {
  const isPositive = Math.random() < 0.55; // 55% positive to trend scores up
  const templates = isPositive ? WELLNESS_ITEMS : STRESSOR_ITEMS;
  const itemConfig = templates[Math.floor(Math.random() * templates.length)];
  
  const playfieldWidth = elements.playfield.clientWidth;
  
  // Create element node
  const itemEl = document.createElement('div');
  itemEl.className = `game-item ${itemConfig.type}`;
  itemEl.innerHTML = `
    <svg class="icon"><use href="#icon-${itemConfig.icon}"></use></svg>
    <span>${itemConfig.label}</span>
  `;
  
  // Append to render bounding rect sizes
  elements.playfield.appendChild(itemEl);
  
  // Determine spawn coordinates
  const elWidth = itemEl.clientWidth || 160;
  const maxX = playfieldWidth - elWidth - 20;
  const startX = Math.max(20, Math.floor(Math.random() * maxX));
  const startY = -60;
  
  itemEl.style.left = `${startX}px`;
  itemEl.style.transform = `translate3d(0px, ${startY}px, 0)`;
  
  // Progress-based falling speed dynamics
  const elapsed = GAME_DURATION - state.timeLeft;
  const progress = elapsed / GAME_DURATION;
  
  // Speeds (pixels/sec converted to pixels/frame roughly)
  const baseSpeed = 160; // slow spawn speed
  const maxSpeed = 380;  // rapid spawn speed
  const actualSpeed = (baseSpeed + (progress * (maxSpeed - baseSpeed))) / 60;
  
  const itemInstance = {
    element: itemEl,
    x: startX,
    y: startY,
    width: elWidth,
    height: itemEl.clientHeight || 50,
    speed: actualSpeed,
    score: itemConfig.score,
    type: itemConfig.type,
    label: itemConfig.label
  };
  
  // Touch interface binder (touch/click combined)
  itemEl.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleItemTap(itemInstance);
  });
  
  state.items.push(itemInstance);
}

// --- Tap Event Handler ---
function handleItemTap(item) {
  if (!state.isPlaying) return;
  
  // 1. Remove from physics list & DOM
  item.element.remove();
  state.items = state.items.filter(it => it !== item);
  
  // 2. Score manipulation
  state.score += item.score;
  elements.hudScore.innerText = state.score;
  
  // Tally stats
  if (item.type === 'positive') {
    state.statWellnessTapped++;
  } else {
    state.statStressorsTapped++;
  }
  
  // 3. Trigger audio synthesizer
  if (item.type === 'positive') {
    audio.playChime();
    popHUDScore('score-pop-pos');
  } else {
    audio.playBuzz();
    popHUDScore('score-pop-neg');
    triggerScreenShake();
  }
  
  // 4. Trigger Particle effects
  spawnParticles(item.x + item.width / 2, item.y + item.height / 2, item.type);
  
  // 5. Inject floating popup numbers (+50 or -30)
  spawnFloatingText(item.x + item.width / 2, item.y, item.score, item.type);
}

// Bounce effect on score
function popHUDScore(className) {
  elements.hudScore.className = `hud-value numeric ${className}`;
  setTimeout(() => {
    if (elements.hudScore.className.includes(className)) {
      elements.hudScore.className = 'hud-value numeric';
    }
  }, 160);
}

// Full screen shake for negative feedback
function triggerScreenShake() {
  elements.container.classList.add('shake');
  setTimeout(() => {
    elements.container.classList.remove('shake');
  }, 350);
}

// --- Floating Score Text Popup ---
function spawnFloatingText(x, y, scoreVal, type) {
  const floatEl = document.createElement('div');
  floatEl.className = `floating-score ${type}`;
  floatEl.innerText = scoreVal > 0 ? `+${scoreVal}` : `${scoreVal}`;
  
  // Center float location
  floatEl.style.left = `${x - 20}px`;
  floatEl.style.top = `${y}px`;
  
  elements.playfield.appendChild(floatEl);
  
  // Auto clean DOM node
  setTimeout(() => {
    floatEl.remove();
  }, 750);
}

// --- Particle Systems ---
class Particle {
  constructor(x, y, color, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    // Shoot outwards in standard circle velocities
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.radius = Math.random() * 4 + 2;
    this.color = color;
    this.alpha = 1.0;
    
    // Decreasing decay rate for longer sparks
    this.decay = Math.random() * 0.02 + 0.015;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Gentle gravity drift downwards
    this.vy += 0.08;
    
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    
    // Glowing neon look using canvas shadows
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function spawnParticles(x, y, type) {
  const count = 16;
  const color = type === 'positive' ? '#10b981' : '#f43f5e';
  
  for (let i = 0; i < count; i++) {
    state.particles.push(new Particle(x, y, color, type));
  }
}

function updateAndDrawParticles() {
  // Draw / clear logic
  ctx.clearRect(0, 0, elements.fxCanvas.width, elements.fxCanvas.height);
  
  const particlesToRemove = [];
  
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    p.update();
    p.draw();
    
    if (p.alpha <= 0) {
      particlesToRemove.push(p);
    }
  }
  
  // Prune dead particles
  state.particles = state.particles.filter(p => !particlesToRemove.includes(p));
}

// --- Main 60fps Game Loop ---
function gameLoop(currentTime) {
  if (!state.isPlaying) return;
  
  if (!state.lastTime) state.lastTime = currentTime;
  const deltaTime = currentTime - state.lastTime;
  state.lastTime = currentTime;
  
  // 1. Particle Systems updates
  updateAndDrawParticles();
  
  // 2. Spawn elements based on timer progression
  state.spawnAccumulator += deltaTime;
  const currentInterval = getSpawnInterval();
  if (state.spawnAccumulator >= currentInterval) {
    spawnItem();
    state.spawnAccumulator = 0;
  }
  
  // 3. Falling elements physics & collision check
  const playfieldHeight = elements.playfield.clientHeight;
  const itemsToRemove = [];
  
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    
    // Fall update
    item.y += item.speed;
    item.element.style.transform = `translate3d(0px, ${item.y}px, 0)`;
    
    // Fall off screen check
    if (item.y > playfieldHeight + 20) {
      itemsToRemove.push(item);
    }
  }
  
  // Prune missed elements
  for (const item of itemsToRemove) {
    item.element.remove();
    state.items = state.items.filter(it => it !== item);
  }
  
  // Continue animation queue
  state.gameLoopId = requestAnimationFrame(gameLoop);
}

// Set app loaded indicators
window.addEventListener('DOMContentLoaded', () => {
  showScreen(elements.welcome);
  elements.inputName.focus();
});
