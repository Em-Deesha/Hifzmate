document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to be ready
  if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded. Please check firebase-config.js');
    return;
  }

  const sections = document.querySelectorAll('.tab-section');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const surahDropdown = document.getElementById('surahDropdown');
  const qariSelector = document.getElementById('qariSelector');
  const badgeContainer = document.getElementById('badgeContainer');
  const reviewReminder = document.getElementById('reviewReminder');
  const reminderText = document.getElementById('reminderText');
  const closeReminder = document.getElementById('closeReminder');
  const reviseNow = document.getElementById('reviseNow');
  const surahSelector = document.getElementById('surahSelector');

  let currentSurah = 1;
  let tajweed = false;
  let currentQari = 'ar.alafasy';
  let score = 0;
  let mistakes = [];
  let plans = [];
  let badges = [];
  let bookmarks = [];
  let earnedBadges = [];
  let currentUser = null;
  let userData = null;

  // Badge sound and popup
  const badgeSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  const badgePopup = document.createElement('div');
  badgePopup.className = 'badge-popup';
  badgePopup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #4CAF50, #2196F3);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    z-index: 1000;
    text-align: center;
    color: white;
    display: none;
    animation: popIn 0.5s ease-out;
  `;
  document.body.appendChild(badgePopup);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes popIn {
      0% { transform: translate(-50%, -50%) scale(0); }
      80% { transform: translate(-50%, -50%) scale(1.1); }
      100% { transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes fadeOut {
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // ==================== FIREBASE AUTHENTICATION ====================
  
  // Initialize authentication state
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      await loadUserData(user.uid);
      updateUIForLoggedInUser(user);
    } else {
      currentUser = null;
      userData = null;
      updateUIForLoggedOutUser();
      // Load from localStorage as fallback
      loadFromLocalStorage();
    }
  });

  // Authentication UI handlers
  const authModal = document.getElementById('authModal');
  const authBtn = document.getElementById('authBtn');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const authTabBtns = document.querySelectorAll('.auth-tab-btn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

  // Open auth modal
  authBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
  });

  // Close auth modal
  closeAuthModal.addEventListener('click', () => {
    authModal.classList.add('hidden');
    clearAuthMessages();
  });

  // Auth tab switching
  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-auth-tab');
      authTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
      } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
      }
      clearAuthMessages();
    });
  });

  // Login handler
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('authError');
    
    if (!email || !password) {
      showError(errorDiv, 'Please fill in all fields');
      return;
    }

    const result = await firebaseService.signIn(email, password);
    if (result.success) {
      showSuccess(document.getElementById('authSuccess'), 'Login successful!');
      setTimeout(() => {
        authModal.classList.add('hidden');
        clearAuthMessages();
      }, 1000);
    } else {
      showError(errorDiv, result.error);
    }
  });

  // Signup handler
  signupBtn.addEventListener('click', async () => {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const errorDiv = document.getElementById('signupError');
    
    if (!name || !email || !password || !passwordConfirm) {
      showError(errorDiv, 'Please fill in all fields');
      return;
    }

    if (password !== passwordConfirm) {
      showError(errorDiv, 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError(errorDiv, 'Password must be at least 6 characters');
      return;
    }

    const result = await firebaseService.signUp(email, password, name);
    if (result.success) {
      showSuccess(document.getElementById('signupSuccess'), 'Account created successfully!');
      setTimeout(() => {
        authModal.classList.add('hidden');
        clearAuthMessages();
      }, 1000);
    } else {
      showError(errorDiv, result.error);
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', async () => {
    await firebaseService.signOut();
    currentUser = null;
    userData = null;
    updateUIForLoggedOutUser();
    loadFromLocalStorage();
  });

  // Forgot password handler
  forgotPasswordBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const errorDiv = document.getElementById('authError');
    
    if (!email) {
      showError(errorDiv, 'Please enter your email address');
      return;
    }

    const result = await firebaseService.resetPassword(email);
    if (result.success) {
      showSuccess(document.getElementById('authSuccess'), 'Password reset email sent!');
    } else {
      showError(errorDiv, result.error);
    }
  });

  // Helper functions for auth UI
  function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => element.classList.remove('show'), 5000);
  }

  function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => element.classList.remove('show'), 5000);
  }

  function clearAuthMessages() {
    document.getElementById('authError').classList.remove('show');
    document.getElementById('authSuccess').classList.remove('show');
    document.getElementById('signupError').classList.remove('show');
    document.getElementById('signupSuccess').classList.remove('show');
  }

  function updateUIForLoggedInUser(user) {
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('authBtn').classList.add('hidden');
    document.getElementById('userDisplayName').textContent = user.displayName || user.email;
  }

  function updateUIForLoggedOutUser() {
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('authBtn').classList.remove('hidden');
  }

  // Load user data from Firebase
  async function loadUserData(uid) {
    const result = await firebaseService.getUserData(uid);
    if (result.success) {
      userData = result.data;
      mistakes = userData.mistakes || [];
      plans = userData.plans || [];
      badges = userData.badges || [];
      bookmarks = userData.bookmarks || [];
      earnedBadges = userData.earnedBadges || [];
      score = userData.quizScore || 0;
      
      // Apply theme
      const theme = userData.theme || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      const themeIcon = document.querySelector('.theme-icon');
      if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
      
      // Migrate localStorage data if needed
      await firebaseService.migrateLocalStorageToFirebase(uid);
      
      // Render all data
      renderPlans();
      renderBookmarks();
      renderBadges();
      renderMistakes();
      updateProfileDisplay();
    }
  }

  // Load from localStorage (fallback for non-logged-in users)
  function loadFromLocalStorage() {
    mistakes = JSON.parse(localStorage.getItem('mistakes') || '[]');
    plans = JSON.parse(localStorage.getItem('plans') || '[]');
    badges = JSON.parse(localStorage.getItem('badges') || '[]');
    bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    earnedBadges = JSON.parse(localStorage.getItem('earnedBadges') || '[]');
    score = parseInt(localStorage.getItem('quizScore') || '0');
    
    renderPlans();
    renderBookmarks();
    renderBadges();
    renderMistakes();
  }

  // Save data to Firebase or localStorage
  async function saveData(type, data) {
    if (currentUser) {
      const uid = currentUser.uid;
      switch(type) {
        case 'plans':
          await firebaseService.savePlans(uid, data);
          break;
        case 'bookmarks':
          await firebaseService.saveBookmarks(uid, data);
          break;
        case 'badges':
          await firebaseService.saveBadges(uid, data);
          break;
        case 'mistakes':
          await firebaseService.saveMistakes(uid, data);
          break;
        case 'quizScore':
          await firebaseService.updateQuizScore(uid, data);
          break;
        case 'theme':
          await firebaseService.saveTheme(uid, data);
          break;
      }
    } else {
      // Fallback to localStorage
      switch(type) {
        case 'plans':
          localStorage.setItem('plans', JSON.stringify(data));
          break;
        case 'bookmarks':
          localStorage.setItem('bookmarks', JSON.stringify(data));
          break;
        case 'badges':
          localStorage.setItem('badges', JSON.stringify(data));
          localStorage.setItem('earnedBadges', JSON.stringify(data.map(b => b.surahNum)));
          break;
        case 'mistakes':
          localStorage.setItem('mistakes', JSON.stringify(data));
          break;
        case 'quizScore':
          localStorage.setItem('quizScore', data.toString());
          break;
        case 'theme':
          localStorage.setItem('theme', data);
          break;
      }
    }
  }

  // ==================== TABS ====================
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`).classList.add('active');
      
      if (section === 'bookmarks') {
        renderBookmarks();
      } else if (section === 'badges') {
        renderBadges();
      } else if (section === 'profile') {
        updateProfileDisplay();
      }
    });
  });
  document.getElementById('section-reader').classList.add('active');

  // ==================== SURAH NAMES ====================
  const surahNames = await fetch('https://api.alquran.cloud/v1/meta')
    .then(res => res.json())
    .then(d => d.data.surahs.references);

  surahNames.forEach(s => {
    const optReader = document.createElement('option');
    optReader.value = s.number;
    optReader.textContent = `${s.number}. ${s.englishName} (${s.name})`;
    surahSelector.appendChild(optReader);

    const optPlanner = document.createElement('option');
    optPlanner.value = s.number;
    optPlanner.textContent = `${s.number}. ${s.englishName} (${s.name})`;
    surahDropdown.appendChild(optPlanner);
  });

  surahSelector.addEventListener('change', e => {
    currentSurah = parseInt(e.target.value, 10);
    loadSurah(currentSurah);
  });

  const ayahSelector = document.getElementById('ayahSelector');
  if (ayahSelector) {
    ayahSelector.addEventListener('change', e => {
      const ayahNumber = parseInt(e.target.value, 10);
      const ayahs = document.querySelectorAll('.ayah');
      ayahs.forEach((ayah, index) => {
        if (index + 1 === ayahNumber) {
          ayah.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ayah.style.background = 'rgba(26, 77, 46, 0.1)';
          setTimeout(() => {
            ayah.style.background = '';
          }, 2000);
        }
      });
    });
  }

  // ==================== QARI SELECTOR ====================
  const qaris = await fetch('https://api.alquran.cloud/v1/edition?format=audio')
    .then(res => res.json());
  qaris.data.forEach(q => {
    const opt = document.createElement('option');
    opt.value = q.identifier;
    opt.textContent = `${q.englishName}`;
    qariSelector.appendChild(opt);
  });
  qariSelector.addEventListener('change', e => currentQari = e.target.value);

  // ==================== QURAN READER ====================
  async function loadSurah(num) {
    const api = `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,ur.jalandhry`;
    const res = await fetch(api);
    const data = await res.json();
    const [ar, en, ur] = data.data;
    document.getElementById('surahTitleArabic').textContent = ar.name;
    document.getElementById('surahTitleEnglish').textContent = en.englishName;
    
    const ayahSelector = document.getElementById('ayahSelector');
    if (ayahSelector) {
      ayahSelector.innerHTML = '';
      ar.ayahs.forEach((ayah, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = `Ayah ${index + 1}`;
        ayahSelector.appendChild(option);
      });
    }
    
    const container = document.getElementById('ayahs-container');
    container.innerHTML = '';
    
    let lastAyahViewed = false;
    ar.ayahs.forEach((a, i) => {
      const div = document.createElement('div');
      div.className = 'ayah';
      div.innerHTML = `
        <div class="ayah-number">${i + 1}</div>
        <p class="arabic-text">${tajweed ? applyTajweed(a.text) : a.text}</p>
        <p class="translation-text">${en.ayahs[i].text}</p>
        <p class="urdu-text">${ur.ayahs[i].text}</p>
        <button class="playBtn">Play</button>
        <button class="bookmarkBtn">🔖 Bookmark</button>
      `;
      div.querySelector('.playBtn').addEventListener('click', async () => {
        const audio = await fetch(`https://api.alquran.cloud/v1/ayah/${a.number}/${currentQari}`).then(r => r.json());
        new Audio(audio.data.audio).play();
      });
      div.querySelector('.bookmarkBtn').addEventListener('click', async () => {
        bookmarks.push({ surah: ar.englishName, ayah: i+1, text: a.text });
        await saveData('bookmarks', bookmarks);
        alert('Ayah bookmarked!');
        renderBookmarks();
      });
      
      if (i === ar.ayahs.length - 1) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && !lastAyahViewed) {
            lastAyahViewed = true;
            showBadge(num, ar.englishName);
          }
        }, { threshold: 0.5 });
        observer.observe(div);
      }
      
      container.appendChild(div);
    });
    
    const goToTopDiv = document.createElement('div');
    goToTopDiv.className = 'go-to-top-container';
    goToTopDiv.innerHTML = `
      <button id="goToTopBtn" class="go-to-top-btn">
        ⬆️ Go to Top of Surah
      </button>
    `;
    container.appendChild(goToTopDiv);
    
    document.getElementById('goToTopBtn').addEventListener('click', () => {
      const surahHeader = document.querySelector('.surah-header');
      if (surahHeader) {
        surahHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function applyTajweed(text) {
    return text
      .replace(/ن/g, '<span class="tajweed-ghunna">ن</span>')
      .replace(/م/g, '<span class="tajweed-idgham">م</span>')
      .replace(/ق/g, '<span class="tajweed-iqlab">ق</span>')
      .replace(/ل/g, '<span class="tajweed-ikhfaa">ل</span>');
  }

  document.getElementById('showTajweedBtn').addEventListener('click', () => {
    tajweed = !tajweed;
    loadSurah(currentSurah);
  });
  document.getElementById('nextSurah').addEventListener('click', () => { 
    if (currentSurah < 114) {
      showBadge(currentSurah, surahNames[currentSurah-1].englishName);
      currentSurah++;
      loadSurah(currentSurah);
    }
  });
  document.getElementById('prevSurah').addEventListener('click', () => { 
    if (currentSurah > 1) loadSurah(--currentSurah); 
  });

  loadSurah(currentSurah);

  // ==================== BADGES ====================
  const medals = [
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨",
    "🥇","🥈","🥉","🏅","🎖️","🏆","💎","🌟","🛡️","⚡","🔥","💫","🎯","🏵️","🎗️","✨"
  ];

  async function showBadge(surahNum, surahName) {
    if (earnedBadges.includes(surahNum)) return;
    
    badgeSound.currentTime = 0;
    badgeSound.play().catch(err => console.log('Audio play failed:', err));
    
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
    badge.innerHTML = `<div>${medals[surahNum-1]}</div><p>${surahName}</p>`;
    badgeContainer.appendChild(badge);

    badgePopup.innerHTML = `
      <h2>🎉 Achievement Unlocked!</h2>
      <div style="font-size: 3em; margin: 10px;">${medals[surahNum-1]}</div>
      <p>Completed Surah ${surahName}</p>
    `;
    badgePopup.style.display = 'block';
    badgePopup.style.animation = 'popIn 0.5s ease-out';

    setTimeout(() => {
      badgePopup.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => {
        badgePopup.style.display = 'none';
      }, 500);
    }, 3000);

    earnedBadges.push(surahNum);
    badges.push({ surahNum, surahName, medal: medals[surahNum-1] });
    await saveData('badges', badges);
  }

  function renderBadges() {
    badgeContainer.innerHTML = '';
    
    if (badges.length === 0) {
      badgeContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1;">No badges earned yet. Start reading to earn your first badge! 🏆</p>';
      return;
    }
    
    badges.forEach(badge => {
      const badgeElement = document.createElement('div');
      badgeElement.className = 'badge';
      badgeElement.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
      badgeElement.innerHTML = `<div>${badge.medal}</div><p>${badge.surahName}</p>`;
      badgeContainer.appendChild(badgeElement);
    });
  }

  badgeContainer.addEventListener('click', () => {
    const badgeDialog = document.createElement('div');
    badgeDialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
      z-index: 1001;
      max-height: 80vh;
      overflow-y: auto;
      min-width: 300px;
    `;
    
    let badgeHtml = `
      <h2 style="text-align: center; margin-bottom: 20px;">Your Earned Badges (${badges.length}/114)</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;">
    `;
    
    badges.forEach(badge => {
      badgeHtml += `
        <div style="text-align: center; padding: 10px; background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)}); border-radius: 8px; color: white;">
          <div style="font-size: 2em;">${badge.medal}</div>
          <div>${badge.surahName}</div>
        </div>
      `;
    });
    
    badgeHtml += '</div><button id="closeBadgesBtn" style="margin-top: 15px; padding: 5px 15px; display: block; margin: 20px auto;">Close</button>';
    badgeDialog.innerHTML = badgeHtml;
    document.body.appendChild(badgeDialog);
    document.getElementById('closeBadgesBtn').onclick = () => badgeDialog.remove();
  });

  // ==================== PLANNER ====================
  function renderPlans() {
    const c = document.getElementById('plansContainer');
    c.innerHTML = '';
    plans.forEach((p, idx) => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${p.name}</strong> - ${p.surahName} (${p.pace} Ayahs/day)
      <button onclick="deletePlan(${idx})">❌</button>`;
      c.appendChild(div);
    });
  }

  document.getElementById('addPlanBtn').addEventListener('click', async () => {
    const name = document.getElementById('planName').value.trim();
    const surahNum = surahDropdown.value;
    const surahName = surahNames.find(s => s.number == surahNum).englishName;
    const pace = document.getElementById('paceInput').value;
    if (!name) return alert('Enter plan name');
    plans.push({ name, surahNum, surahName, pace });
    await saveData('plans', plans);
    renderPlans();
    showReminder();
  });

  window.deletePlan = async (idx) => {
    plans.splice(idx, 1);
    await saveData('plans', plans);
    renderPlans();
  };

  function showReminder() {
    if (plans.length === 0) return;
    const p = plans[Math.floor(Math.random() * plans.length)];
    reminderText.textContent = `Review "${p.name}" - ${p.surahName} (${p.pace} ayahs/day)`;
    reviewReminder.classList.remove('hidden');
  }
  closeReminder.addEventListener('click', () => reviewReminder.classList.add('hidden'));
  reviseNow.addEventListener('click', () => {
    document.getElementById('section-reader').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    reviewReminder.classList.add('hidden');
  });
  showReminder();

  // ==================== BOOKMARKS ====================
  const bookmarkList = document.getElementById('bookmarkList');
  function renderBookmarks() {
    bookmarkList.innerHTML = '';
    bookmarks.forEach((b, i) => {
      const li = document.createElement('li');
      li.textContent = `${b.surah} - Ayah ${b.ayah}`;
      const del = document.createElement('button');
      del.textContent = '❌';
      del.onclick = async () => {
        bookmarks.splice(i, 1);
        await saveData('bookmarks', bookmarks);
        renderBookmarks();
      };
      li.appendChild(del);
      bookmarkList.appendChild(li);
    });
  }
  document.getElementById('clearBookmarks').addEventListener('click', async () => {
    bookmarks = [];
    await saveData('bookmarks', bookmarks);
    renderBookmarks();
  });

  // ==================== QUIZ ====================
  const quizQ = document.getElementById('quizQuestion');
  const quizA = document.getElementById('quizAnswer');
  const quizF = document.getElementById('quizFeedback');
  const quizS = document.getElementById('quizScore');
  const nextQ = document.getElementById('nextQuestion');

  async function newQuestion() {
    const r = Math.floor(Math.random() * 114) + 1;
    const s = surahNames[r - 1];
    quizQ.textContent = `Which Surah has number ${r}?`;
    quizA.value = '';
    quizF.textContent = '';
    quizA.dataset.answer = s.englishName.toLowerCase();
    nextQ.classList.add('hidden');
  }
  document.getElementById('submitAnswer').addEventListener('click', async () => {
    const ans = quizA.value.trim().toLowerCase();
    const correct = quizA.dataset.answer;
    if (ans === correct) {
      quizF.textContent = '✅ Correct!';
      score++;
      await saveData('quizScore', score);
    } else {
      quizF.textContent = `❌ Wrong! Correct: ${correct}`;
      mistakes.push({ question: quizQ.textContent, correct, your: ans });
      await saveData('mistakes', mistakes);
    }
    quizS.textContent = `Score: ${score}`;
    nextQ.classList.remove('hidden');
  });
  nextQ.addEventListener('click', newQuestion);
  newQuestion();

  // ==================== MISTAKES ====================
  const mistakeList = document.getElementById('mistakeList');
  function renderMistakes() {
    mistakeList.innerHTML = '';
    mistakes.forEach(m => {
      const li = document.createElement('li');
      li.textContent = `${m.question} | Your: ${m.your || '-'} | Correct: ${m.correct}`;
      mistakeList.appendChild(li);
    });
  }
  document.getElementById('clearMistakes').addEventListener('click', async () => {
    mistakes = [];
    await saveData('mistakes', mistakes);
    renderMistakes();
  });

  // ==================== PROFILE ====================
  function updateProfileDisplay() {
    if (!currentUser) {
      document.getElementById('profileName').textContent = 'Not logged in';
      document.getElementById('profileEmail').textContent = 'Please login to view your profile';
      document.getElementById('memberSince').textContent = '';
      return;
    }

    document.getElementById('profileName').textContent = currentUser.displayName || 'User';
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    if (userData && userData.createdAt) {
      const date = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
      document.getElementById('memberSince').textContent = `Member since: ${date.toLocaleDateString()}`;
    }

    document.getElementById('statBadges').textContent = badges.length;
    document.getElementById('statBookmarks').textContent = bookmarks.length;
    document.getElementById('statPlans').textContent = plans.length;
    document.getElementById('statQuizScore').textContent = score;
    document.getElementById('profileDisplayName').value = currentUser.displayName || '';
  }

  document.getElementById('updateProfileBtn').addEventListener('click', async () => {
    if (!currentUser) {
      alert('Please login to update your profile');
      return;
    }

    const newName = document.getElementById('profileDisplayName').value.trim();
    if (!newName) {
      alert('Please enter a display name');
      return;
    }

    try {
      await currentUser.updateProfile({ displayName: newName });
      await firebaseService.updateUserProfile(currentUser.uid, { displayName: newName });
      updateUIForLoggedInUser(currentUser);
      updateProfileDisplay();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  });

  // ==================== THEME ====================
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  
  const savedTheme = userData?.theme || localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  
  themeToggle.addEventListener('click', async () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    await saveData('theme', newTheme);
    
    themeToggle.style.transform = 'scale(1.2) rotate(360deg)';
    setTimeout(() => {
      themeToggle.style.transform = '';
    }, 300);
  });
});
