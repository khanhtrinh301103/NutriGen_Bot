const express = require('express');
const cors = require('cors');
const uploadPhotoRoute = require('./uploadPhoto');
const searchRecipeRoute = require('./searchRecipe'); // 🔥 New

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', uploadPhotoRoute);
app.use('/api', searchRecipeRoute); // 🔥 New

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
