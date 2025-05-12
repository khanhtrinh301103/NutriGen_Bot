const express = require('express');
const cors = require('cors');
const uploadPhotoRoute = require('./uploadPhoto');
const uploadChatPhotoRoute = require('./uploadChatPhoto');
const uploadPostImageRoute = require('./uploadPostImage');
// const searchRecipeRoute = require('./searchRecipe'); // Giữ lại nhưng comment để tham chiếu
const enhancedSearchRecipeRoute = require('./enhanceSearchRecipe');
const getRecipeDetailsRoute = require('./getRecipeDetails');
const getNutritionProfileRoute = require('./getNutritionProfile');
const deletePostImagesRouter = require('./deletePostImages'); 

// Initialize Firebase
console.log('Initializing Firebase...');
try {
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

const app = express();

const allowedOrigins = [
  'https://nutrigenfrontendfinal1.vercel.app',
  'http://localhost:3000', // for local dev, optional
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Handle preflight requests for all routes
app.options('*', cors());
app.use(express.json());

app.use('/api', uploadPhotoRoute);
app.use('/api', uploadChatPhotoRoute);
app.use('/api', uploadPostImageRoute);
// app.use('/api', searchRecipeRoute);
app.use('/api', enhancedSearchRecipeRoute);
app.use('/api', getRecipeDetailsRoute);
app.use('/api', getNutritionProfileRoute);
app.use('/api', deletePostImagesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Use PORT from environment variables for production or default to 5000 for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});