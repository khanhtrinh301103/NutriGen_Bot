cd NutriGen_Bot

environment:
cd backend
npm install
firebase login
firebase use --add
cd ../frontend
npm install

admin@gmail.com
admin123

public api key: (getRecipeDetails.js, enhanceSearchRecipe.js)
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



I make a lot of blended, smooth green sauces – but this lady is a whole new vibe. Spoonable, chunky, and fun. She is the exact thing I didn’t realize my smoky grilled chicken was needing.

The combination of avocado, pistachio, chives, and lemon is like a mashup of guacamole, gremolata, and springtime brightness and it is SO good.

I know some of you are going to look at the sauce ingredients and think you want a lime in there, but give the lemon a chance. The lemon with the chives and the roasty pistachios… it’s so fresh and unique. I want this for you.




OOH BABY these are so good! My husband’s favorite dessert is carrot cake, so the bar is high for us to have a really solid house-favorite carrot cake cupcake recipe.

(I’m also very attached to this carrot cake coffee cake, which is a bit more brunchy, so we now have options.)

They are fluffy and plush with a nice little domed top, but they are also dense and buttery-ish enough to feel like a proper carrot cake!



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
