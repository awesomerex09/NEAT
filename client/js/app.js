import { STUDENT_PROFILES, WORKOUT_SCHEDULES } from '../data/importedData.js';

let appAuth = null;
let provider = null;

// Utility to show toasts
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Switch screens
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    if (s.id === screenId) {
      s.classList.remove('exit');
      s.classList.add('active');
    } else {
      if (s.classList.contains('active')) {
        s.classList.add('exit');
        s.classList.remove('active');
      }
    }
  });
}

function renderDashboard(uid) {
  const profile = STUDENT_PROFILES.find(p => p.firebaseUID === uid);
  const workouts = WORKOUT_SCHEDULES.filter(w => w.studentUID === uid);

  if (!profile) {
    showToast('找不到您的學員資料，請聯繫教練綁定。', 'error', 5000);
    return;
  }

  // Update Header
  document.getElementById('header-user').textContent = `👤 ${profile.name}`;
  
  // Update Profile
  document.getElementById('user-info-name').textContent = profile.name;
  document.getElementById('user-info-phone').textContent = profile.phone;
  document.getElementById('goal-long').textContent = profile.longTermGoal;
  document.getElementById('goal-mid').textContent = profile.midTermGoal;
  document.getElementById('goal-short').textContent = profile.shortTermGoal;

  // Update Schedules
  const feed = document.getElementById('schedule-feed');
  feed.innerHTML = ''; // clear

  if (workouts.length === 0) {
    feed.innerHTML = `
      <div class="quiet-card" style="text-align:center;">
        <div class="event-desc">目前沒有安排中的課表。</div>
      </div>
    `;
  } else {
    workouts.forEach(workout => {
      const card = document.createElement('div');
      card.className = 'event-card';
      
      let exercisesHtml = workout.exercises.map((ex, i) => `
        <div style="display:flex; gap:12px; margin-bottom:8px;">
          <span style="color:var(--c-text-3); font-family:var(--font-mono);">${String(i+1).padStart(2,'0')}</span>
          <span>${ex}</span>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="event-header">
          <div class="event-icon neutral">🗓️</div>
          <div>
            <div class="event-title">${workout.date} | ${workout.timeSlot}</div>
            <div class="event-meta">狀態：<span style="color:var(--c-up)">${workout.status}</span></div>
          </div>
        </div>
        <div class="event-desc" style="margin-top:16px;">
          <div style="font-size:0.75rem; color:var(--c-text-3); margin-bottom:8px; text-transform:uppercase;">訓練內容</div>
          ${exercisesHtml}
        </div>
      `;
      feed.appendChild(card);
    });
  }

  showScreen('screen-game');
}

// Init App
async function init() {
  const { initializeApp, getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } = window.firebase;
  
  const app = initializeApp(window.firebaseConfig);
  appAuth = getAuth(app);
  provider = new GoogleAuthProvider();

  // Listen to auth state
  onAuthStateChanged(appAuth, (user) => {
    if (user) {
      showToast(`登入成功！歡迎，${user.displayName}`, 'success');
      renderDashboard(user.uid);
    } else {
      showScreen('screen-splash');
    }
  });

  // Bind Buttons
  document.getElementById('btn-google-login').addEventListener('click', async () => {
    try {
      await signInWithPopup(appAuth, provider);
    } catch (e) {
      showToast('登入失敗，請確認 Firebase 設定或授權網域。', 'error', 5000);
      console.error(e);
    }
  });

  document.getElementById('btn-sign-out').addEventListener('click', async () => {
    await signOut(appAuth);
    showToast('已登出', 'info');
  });
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', init);
