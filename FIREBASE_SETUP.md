# Firebase Setup Guide for HifzMate

This guide will help you connect HifzMate to Firebase for authentication and database functionality.

## Prerequisites

1. A Google account
2. A Firebase project (free tier is sufficient)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "hifzmate")
4. Follow the setup wizard:
   - Disable Google Analytics (optional, you can enable it later)
   - Click "Create project"
5. Wait for the project to be created

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Click on **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Create Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
   - **Important**: For production, you'll need to set up security rules
4. Select a location for your database (choose the closest to your users)
5. Click **Enable**

### Security Rules (Important for Production)

After setting up, go to **Rules** tab and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 4: Get Your Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "HifzMate Web")
6. Copy the Firebase configuration object

## Step 5: Configure Your App

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Example:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "hifzmate-12345.firebaseapp.com",
  projectId: "hifzmate-12345",
  storageBucket: "hifzmate-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 6: Test Your Setup

1. Start your local server:
   ```bash
   python3 -m http.server 5000
   ```

2. Open `http://localhost:5000` in your browser

3. Click the user icon (👤) in the header to open the authentication modal

4. Try creating a new account:
   - Click "Sign Up" tab
   - Enter your name, email, and password
   - Click "Sign Up"

5. If successful, you should see:
   - Your name displayed in the header
   - A logout button
   - Access to the Profile section

## Features Enabled

Once Firebase is configured, you'll have:

✅ **User Authentication**
- Sign up with email/password
- Login/Logout
- Password reset functionality
- User session persistence

✅ **Cloud Database**
- All your data (plans, bookmarks, badges, mistakes) synced to Firebase
- Access your data from any device
- Automatic data backup

✅ **User Profile**
- View your statistics
- Update your display name
- See your member since date

## Data Migration

When you first log in, the app will automatically:
- Migrate any existing localStorage data to Firebase
- Keep Firebase data if it exists (won't overwrite)
- Preserve your progress and achievements

## Troubleshooting

### "Firebase is not loaded" error
- Make sure `firebase-config.js` is loaded before `script.js`
- Check that Firebase SDK scripts are loaded in `index.html`
- Verify your internet connection

### Authentication not working
- Check that Email/Password is enabled in Firebase Console
- Verify your Firebase config values are correct
- Check browser console for error messages

### Data not saving
- Make sure Firestore Database is created
- Check that you're logged in (authentication required)
- Verify Firestore security rules allow your user to write

### CORS errors
- Make sure you're running the app from a web server (not file://)
- Use `python3 -m http.server` or similar

## Security Notes

⚠️ **Important for Production:**

1. **Never commit `firebase-config.js` with real credentials to public repositories**
   - Add it to `.gitignore`
   - Use environment variables or a config service

2. **Set up proper Firestore security rules** (see Step 3)

3. **Enable Firebase App Check** for additional security

4. **Use Firebase Hosting** for production deployment

## Next Steps

- Set up Firebase Hosting for production deployment
- Configure custom domain (optional)
- Set up Firebase Analytics (optional)
- Add more authentication methods (Google, Facebook, etc.)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all Firebase services are enabled
3. Ensure your Firebase config is correct
4. Check Firebase Console for any service errors

---

**Happy coding! 🚀**

