const express = require('express');
const cors = require('cors');
const uploadPhotoRoute = require('./uploadPhoto'); // Import API upload ảnh

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', uploadPhotoRoute); // Gọi API upload ảnh

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
