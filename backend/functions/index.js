const express = require('express');
const cors = require('cors');
const uploadPhotoRoute = require('./uploadPhoto');
const searchRecipeRoute = require('./searchRecipe');
const getRecipeDetailsRoute = require('./getRecipeDetails'); // Added new route

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', uploadPhotoRoute);
app.use('/api', searchRecipeRoute);
app.use('/api', getRecipeDetailsRoute); // Added new route

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});