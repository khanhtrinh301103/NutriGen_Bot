cd NutriGen_Bot

environment:
cd backend
npm install
firebase login
firebase use --add
cd ../frontend
npm install



public api key:
7a6e45249407478683346a18f937ba47
026008f475974904a5fff1f27ac6a23c
d9d003f4f57646289aa4d50386b24ef6
9c657b351ef94436ba49efe35a78d955

backend:
cd D:\SEPM\NutriGen_Bot\backend
node index.js


Frontend:
cd D:\SEPM\NutriGen_Bot\frontend
npm run dev

Check document.txt for workspace of developers





Working scope of developer:

backend/
│── functions/                # Folder containing all auxiliary code
│   │── index.js              # Main declaration file of Firebase Functions <-- Write API Endpoints
│   │── package.json          # List of dependencies
│   │── .gitignore            # Gitignore file
│── src/                  # Contains supporting logic files
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
