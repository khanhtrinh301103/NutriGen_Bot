cd NutriGen_Bot

environment:
cd backend
npm install
cd ../frontend
npm install
firebase login
firebase use --add




backend:
cd D:\SEPM\NutriGen_Bot\backend
firebase emulators:start

Frontend:
cd D:\SEPM\NutriGen_Bot\frontend
npm run dev
