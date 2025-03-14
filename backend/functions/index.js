const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const SPOONACULAR_API_KEY = "026008f475974904a5fff1f27ac6a23c"; // Thay bằng API key thật

exports.getRecipe = functions.https.onRequest(async (req, res) => {
  try {
    const { query } = req.query; // Lấy từ khóa tìm kiếm từ query params
    if (!query) {
      return res.status(400).json({ error: "Missing 'query' parameter" });
    }

    // Gọi API từ Spoonacular
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${query}&number=3`
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
