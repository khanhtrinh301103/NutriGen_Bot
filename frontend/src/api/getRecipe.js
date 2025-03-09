import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5001/nutrigen-bot-dd79d/us-central1"; // Replace if backend has different URL

export const getRecipe = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getRecipe`, {
      params: { query },
    });
    return response.data.results; // Returns the list of dishes
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};
