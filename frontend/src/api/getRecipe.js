import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5001/nutrigen-bot-dd79d/us-central1"; // Thay thế nếu backend có URL khác

export const getRecipe = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getRecipe`, {
      params: { query },
    });
    return response.data.results; // Trả về danh sách món ăn
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};
