/**
 * Frontend API client for recipe search and retrieval
 * Supports both regular and nutrition-based recipe search
 */

// Import getNutritionRecommendations để lấy thông tin profile dinh dưỡng
import { getNutritionRecommendations } from './getUserHealthProfile';

/**
 * Sends a search request to the backend API
 * @param {string} searchTerm - User's search query
 * @param {string} cuisine - Selected cuisine filter
 * @param {function} setResult - Callback function to set results
 * @param {boolean} nutritionMode - Whether nutrition mode is enabled
 */
export const sendSearchRequest = async (searchTerm, cuisine, setResult, nutritionMode = false) => {
  console.log("🚀 [Frontend] Sending enhanced search request...");
  console.log("🔍 Keyword:", searchTerm);
  console.log("🌍 Cuisine:", cuisine);
  console.log("📊 Nutrition Mode:", nutritionMode ? "Enabled" : "Disabled");

  try {
    // Chuẩn bị dữ liệu cơ bản
    const requestData = {
      searchTerm,
      cuisine,
      nutritionMode
    };

    // Nếu chế độ dinh dưỡng được bật, thêm thông tin dinh dưỡng
    if (nutritionMode) {
      console.log("📊 [Frontend] Fetching nutrition profile for search");
      try {
        // Lấy khuyến nghị dinh dưỡng từ cache hoặc API
        const nutritionProfile = await getNutritionRecommendations();
        requestData.nutritionProfile = nutritionProfile;
        console.log("✅ [Frontend] Added nutrition profile to search request");
      } catch (profileError) {
        console.error("⚠️ [Frontend] Unable to get nutrition profile:", profileError);
        // Vẫn tiếp tục tìm kiếm nhưng không có thông tin dinh dưỡng
        console.log("⚠️ [Frontend] Continuing search without nutrition profile");
      }
    }

    // Gửi request đến API
    const res = await fetch("http://localhost:5000/api/searchRecipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    // Xử lý kết quả
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    
    // Kiểm tra cấu trúc dữ liệu trả về (đơn giản hoặc có fallback)
    if (data && typeof data === 'object' && data.recipes) {
      // Đây là cấu trúc trả về có thông tin fallback
      console.log("✅ [Frontend] Received results from backend:", data.recipes.length);
      
      // Xử lý thông tin fallback
      if (data.fallback && data.fallback.applied) {
        console.log(`⚠️ [Frontend] Search used fallback mode: ${data.fallback.message}`);
        // Có thể hiển thị thông báo cho người dùng về việc đã nới lỏng điều kiện tìm kiếm
        
        // Nhưng giữ nguyên kết quả đã lọc
        setResult(data.recipes);
      } else {
        setResult(data.recipes);
      }
    } else {
      // Cấu trúc dữ liệu trả về đơn giản (mảng recipes)
      console.log("✅ [Frontend] Received results from backend:", data.length);
      setResult(data);
    }
    
    // Log chi tiết hơn nếu ở chế độ dinh dưỡng
    if (nutritionMode) {
      const resultArray = Array.isArray(data) ? data : (data.recipes || []);
      if (resultArray.length > 0) {
        console.log("📊 [Frontend] Sample recipe with nutrition scores:", {
          title: resultArray[0].title,
          nutritionMatchPercentage: resultArray[0].nutritionMatchPercentage,
          overallMatchPercentage: resultArray[0].overallMatchPercentage
        });
      }
    } else {
      const resultArray = Array.isArray(data) ? data : (data.recipes || []);
      console.table(resultArray.slice(0, 3)); // Hiển thị 3 kết quả đầu tiên
    }
  } catch (error) {
    console.error("❌ [Frontend] Error calling backend:", error);
    // Vẫn gọi callback nhưng với mảng rỗng để tránh UI bị treo
    setResult([]);
    // Có thể thêm xử lý lỗi ở đây nếu cần
  }
};

/**
 * Fetches detailed recipe information by ID
 * @param {number} recipeId - ID of the recipe to fetch
 * @returns {Promise<Object>} Recipe details object
 */
export const getRecipeDetails = async (recipeId) => {
  console.log("🚀 [Frontend] Fetching recipe details for ID:", recipeId);
  
  // Validate ID
  if (!recipeId) {
    console.error("❌ [Frontend] Missing recipe ID");
    throw new Error("Recipe ID is required");
  }
  
  try {
    const res = await fetch(`http://localhost:5000/api/recipe/${recipeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ [Frontend] Received recipe details from backend:", data.title);
    return data;
  } catch (error) {
    console.error("❌ [Frontend] Error fetching recipe details:", error);
    throw error; // Re-throw để xử lý trong component
  }
};