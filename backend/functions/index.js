const express = require('express');
const cors = require('cors');
const uploadPhotoRoute = require('./uploadPhoto');
const uploadChatPhotoRoute = require('./uploadChatPhoto');
const uploadPostImageRoute = require('./uploadPostImage'); // Thêm route mới cho upload ảnh blog
// const searchRecipeRoute = require('./searchRecipe'); // Giữ lại nhưng comment để tham chiếu
const enhancedSearchRecipeRoute = require('./enhanceSearchRecipe');
const getRecipeDetailsRoute = require('./getRecipeDetails');
const getNutritionProfileRoute = require('./getNutritionProfile');
const deletePostImagesRouter = require('./deletePostImages'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', uploadPhotoRoute);
app.use('/api', uploadChatPhotoRoute);
app.use('/api', uploadPostImageRoute); // Thêm route mới
// app.use('/api', searchRecipeRoute);
app.use('/api', enhancedSearchRecipeRoute);
app.use('/api', getRecipeDetailsRoute);
app.use('/api', getNutritionProfileRoute);
app.use('/api', deletePostImagesRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});