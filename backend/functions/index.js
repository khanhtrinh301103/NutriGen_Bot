const express = require('express');
const cors = require('cors');
const uploadPhotoRoute = require('./uploadPhoto');
const uploadChatPhotoRoute = require('./uploadChatPhoto'); // Thêm route mới
// const searchRecipeRoute = require('./searchRecipe'); // Giữ lại nhưng comment để tham chiếu
const enhancedSearchRecipeRoute = require('./enhanceSearchRecipe'); // Thay thế bằng phiên bản nâng cao
const getRecipeDetailsRoute = require('./getRecipeDetails');
const getNutritionProfileRoute = require('./getNutritionProfile');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', uploadPhotoRoute);
app.use('/api', uploadChatPhotoRoute); // Thêm route mới
// app.use('/api', searchRecipeRoute); // Thay thế bằng phiên bản nâng cao
app.use('/api', enhancedSearchRecipeRoute); // Sử dụng endpoint tìm kiếm nâng cao
app.use('/api', getRecipeDetailsRoute);
app.use('/api', getNutritionProfileRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});