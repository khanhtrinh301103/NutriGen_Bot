cd NutriGen_Bot

environment:
cd backend
npm install
firebase login
firebase use --add
cd ../frontend
npm install





backend:
cd D:\SEPM\NutriGen_Bot\backend
firebase emulators:start

Frontend:
cd D:\SEPM\NutriGen_Bot\frontend
npm run dev


project structure and working scope of developer:

backend/
│── functions/                # Folder containing all auxiliary code
│   │── index.js              # Main declaration file of Firebase Functions <-- Write API Endpoints
│   │── package.json          # List of dependencies
│   │── .gitignore            # Gitignore file
│   ├── src/                  # Contains supporting logic files
│   │   ├── auth.js           # Authentication handling (Login, Register)
│   │   ├── recipes.js        # API handling to get recipes
│   │   ├── firestore.js      # Functions that work with Firestore Database
│   │   ├── users.js          # User information management
│── firebase.json             # Firebase configuration
│── .firebaserc               # Firebase project link
│── package.json              # Common dependencies


📂 frontend
 ├── 📂 src
 │    ├── 📂 pages
 │    │    ├── 📄 index.tsx   <-- Home Page
 │    │    ├── 📄 login.tsx   <-- Login Page
 │    │    ├── 📄 about.tsx   <-- About Page
 │    ├── 📂 styles
 │    │    ├── 📄 globals.css  <-- Contains Tailwind CSS
 │    ├── 📂 api
 │    │    ├── 📄 getRecipe.js  <-- Sends request to backend API
