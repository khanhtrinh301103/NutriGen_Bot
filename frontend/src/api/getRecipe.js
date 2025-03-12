// API service for fetching recipes from backend
const API_BASE_URL = "http://127.0.0.1:5001/nutrigen-bot/us-central1"; // Base URL for backend API

// Function to fetch recipes based on query
export const getRecipe = async (query) => {
  try {
    // Send request to backend endpoint
    const response = await fetch(`${API_BASE_URL}/getRecipe?query=${encodeURIComponent(query)}`);
    
    // Check if response is successful
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Parse response data
    const data = await response.json();
    return data.results || []; 
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return []; // Return empty array on error
  }
};

// Function to fetch recipe details by ID
export const getRecipeById = async (id) => {
  try {
    // Send request to backend endpoint
    const response = await fetch(`${API_BASE_URL}/getRecipeDetails?id=${id}`);
    
    // Check if response is successful
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Parse response data
    const data = await response.json();
    return data; 
  } catch (error) {
    console.error(`Error fetching recipe details for ID ${id}:`, error);
    return null; // Return null on error
  }
};