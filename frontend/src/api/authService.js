// API service for authentication operations
const API_BASE_URL = "http://127.0.0.1:5001/nutrigen-bot/us-central1"; // Base URL for backend API

// Function to register a new user
export const registerUser = async (userData) => {
  try {
    // Send POST request to backend
    const response = await fetch(`${API_BASE_URL}/registerUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    // Parse response data
    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error; // Re-throw the error for handling in components
  }
};

// Function to sign in a user
export const signIn = async (credentials) => {
  try {
    // Send POST request to backend
    const response = await fetch(`${API_BASE_URL}/signIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sign in failed');
    }
    
    // Parse response data
    return await response.json();
  } catch (error) {
    console.error("Sign in error:", error);
    throw error; // Re-throw the error for handling in components
  }
};

// Function to sign out the current user
export const signOut = async () => {
  try {
    // Send POST request to backend
    const response = await fetch(`${API_BASE_URL}/signOut`, {
      method: 'POST',
    });
    
    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sign out failed');
    }
    
    // Parse response data
    return await response.json();
  } catch (error) {
    console.error("Sign out error:", error);
    throw error; // Re-throw the error for handling in components
  }
};