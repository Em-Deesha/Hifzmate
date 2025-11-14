// Firebase Service Module
// Handles all Firebase operations for the app

class FirebaseService {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.currentUser = null;
  }

  // Authentication Methods
  async signUp(email, password, displayName) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName });
      
      // Create user document in Firestore
      await this.db.collection('users').doc(userCredential.user.uid).set({
        displayName,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        plans: [],
        bookmarks: [],
        badges: [],
        mistakes: [],
        earnedBadges: [],
        quizScore: 0,
        theme: 'light'
      });
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // User Data Methods
  async getUserData(uid) {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, error: 'User data not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUserData(uid, data) {
    try {
      await this.db.collection('users').doc(uid).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUserProfile(uid, profileData) {
    try {
      await this.db.collection('users').doc(uid).update({
        ...profileData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Plans Methods
  async savePlans(uid, plans) {
    try {
      await this.db.collection('users').doc(uid).update({
        plans: plans,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Bookmarks Methods
  async saveBookmarks(uid, bookmarks) {
    try {
      await this.db.collection('users').doc(uid).update({
        bookmarks: bookmarks,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Badges Methods
  async saveBadges(uid, badges) {
    try {
      await this.db.collection('users').doc(uid).update({
        badges: badges,
        earnedBadges: badges.map(b => b.surahNum),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mistakes Methods
  async saveMistakes(uid, mistakes) {
    try {
      await this.db.collection('users').doc(uid).update({
        mistakes: mistakes,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Quiz Score Methods
  async updateQuizScore(uid, score) {
    try {
      await this.db.collection('users').doc(uid).update({
        quizScore: score,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Theme Methods
  async saveTheme(uid, theme) {
    try {
      await this.db.collection('users').doc(uid).update({
        theme: theme,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time listener for user data
  subscribeToUserData(uid, callback) {
    return this.db.collection('users').doc(uid).onSnapshot((doc) => {
      if (doc.exists) {
        callback({ success: true, data: doc.data() });
      } else {
        callback({ success: false, error: 'User data not found' });
      }
    });
  }

  // Migrate localStorage data to Firebase
  async migrateLocalStorageToFirebase(uid) {
    try {
      const localPlans = JSON.parse(localStorage.getItem('plans') || '[]');
      const localBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const localBadges = JSON.parse(localStorage.getItem('badges') || '[]');
      const localMistakes = JSON.parse(localStorage.getItem('mistakes') || '[]');
      const localEarnedBadges = JSON.parse(localStorage.getItem('earnedBadges') || '[]');
      const localTheme = localStorage.getItem('theme') || 'light';

      const userDoc = await this.db.collection('users').doc(uid).get();
      const existingData = userDoc.exists ? userDoc.data() : {};

      // Only migrate if Firebase data is empty or doesn't exist
      const dataToUpdate = {
        plans: existingData.plans && existingData.plans.length > 0 ? existingData.plans : localPlans,
        bookmarks: existingData.bookmarks && existingData.bookmarks.length > 0 ? existingData.bookmarks : localBookmarks,
        badges: existingData.badges && existingData.badges.length > 0 ? existingData.badges : localBadges,
        mistakes: existingData.mistakes && existingData.mistakes.length > 0 ? existingData.mistakes : localMistakes,
        earnedBadges: existingData.earnedBadges && existingData.earnedBadges.length > 0 ? existingData.earnedBadges : localEarnedBadges,
        theme: existingData.theme || localTheme,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await this.db.collection('users').doc(uid).set(dataToUpdate, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
const firebaseService = new FirebaseService();

