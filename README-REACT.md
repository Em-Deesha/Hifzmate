# HifzMate React Setup Guide

This guide will help you set up and run the React version of HifzMate with the beautiful new Home page.

## Prerequisites

- Node.js 16+ and npm installed
- Firebase project configured (see FIREBASE_SETUP.md)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Make sure Firebase is configured**
   - Check that `firebase-config.js` has your Firebase credentials
   - Ensure Firebase Authentication and Firestore are enabled

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - The app will automatically open at `http://localhost:3000`
   - Or manually navigate to the URL shown in the terminal

## Project Structure

```
fyp-project-main/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar with all links
│   │   ├── HeroSection.jsx     # Hero section with welcome message
│   │   ├── FeatureCard.jsx    # Feature cards component
│   │   └── AuthModal.jsx      # Login/Signup modal
│   ├── pages/
│   │   ├── Home.jsx            # Beautiful home page
│   │   ├── QuranReader.jsx    # Quran Reader page (to integrate)
│   │   ├── Planner.jsx         # Planner page (to integrate)
│   │   ├── Quiz.jsx            # Quiz page (to integrate)
│   │   ├── Bookmarks.jsx       # Bookmarks page (to integrate)
│   │   ├── Badges.jsx          # Badges page (to integrate)
│   │   └── Profile.jsx         # Profile page (to integrate)
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind CSS styles
├── firebase-config.js          # Firebase configuration
├── firebase-service.js        # Firebase service module
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
└── tailwind.config.js          # Tailwind configuration
```

## Features

### Home Page
- ✅ Modern, clean UI with Islamic theme (green + gold + white)
- ✅ Responsive design for desktop and mobile
- ✅ Hero section with personalized welcome message
- ✅ Four feature cards with hover animations
- ✅ Smooth transitions and modern design
- ✅ Dark/Light mode support

### Navigation
- ✅ Top navbar with all sections
- ✅ Active route highlighting
- ✅ Mobile-responsive menu
- ✅ User authentication state display
- ✅ Dark mode toggle

### Authentication
- ✅ Login/Signup modal
- ✅ Firebase Authentication integration
- ✅ User state management
- ✅ Protected routes

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Integration with Existing Code

The React app is set up to work alongside your existing vanilla JS code. To fully integrate:

1. **Migrate existing functionality** to React components:
   - Copy Quran Reader logic to `QuranReader.jsx`
   - Copy Planner logic to `Planner.jsx`
   - Copy Quiz logic to `Quiz.jsx`
   - Copy Bookmarks logic to `Bookmarks.jsx`
   - Copy Badges logic to `Badges.jsx`
   - Copy Profile logic to `Profile.jsx`

2. **Update routing** - The app now routes to Home by default for logged-in users

3. **Firebase integration** - Already set up and working

## Customization

### Colors
Edit `tailwind.config.js` to customize the Islamic color palette:
```javascript
colors: {
  islamic: {
    green: '#1a4d2e',
    'green-light': '#2d5a3d',
    gold: '#d4af37',
    // ... add more colors
  }
}
```

### Features
Add more feature cards in `Home.jsx` by adding to the `features` array.

## Troubleshooting

### "Firebase is not loaded"
- Make sure `firebase-config.js` and `firebase-service.js` are in the public directory
- Check that Firebase SDK scripts are loaded in `index-react.html`

### "Module not found"
- Run `npm install` to install all dependencies
- Make sure you're in the project root directory

### Port already in use
- Change the port in `vite.config.js`:
  ```javascript
  server: {
    port: 3001, // Change to any available port
  }
  ```

## Next Steps

1. Integrate your existing Quran Reader functionality
2. Add real user statistics to the Home page
3. Enhance the feature cards with actual data
4. Add more animations and interactions
5. Deploy to production

---

**Enjoy your beautiful new Home page! 🎉**

