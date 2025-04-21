// frontend/src/utils/dietaryConflicts.ts

// Define types for various diet and allergy relationships
type DietConflictsMap = {
    [key: string]: string[];
  };
  
  type AllergyRelationshipsMap = {
    [key: string]: string[];
  };
  
  type DietRestrictionsMap = {
    [key: string]: string[];
  };
  
  type CrossAllergiesMap = {
    [key: string]: string[];
  };
  
  /**
   * Map of dietary restrictions and their conflicting diets
   * If a user selects a diet, they cannot select any of the conflicting diets
   */
  export const DIET_CONFLICTS: DietConflictsMap = {
    'Vegan': ['Keto', 'Paleo', 'Pescatarian'],
    'Vegetarian': ['Paleo'],
    'Keto': ['Vegan', 'Mediterranean'],
    'Paleo': ['Vegan', 'Vegetarian', 'Mediterranean'],
    'Mediterranean': ['Keto', 'Paleo'],
    'Pescatarian': ['Vegan'],
    // Dairy-Free isn't in strict conflict with Vegetarian, but may require adjustments
  };
  
  /**
   * Mối quan hệ giữa các dị ứng (loại A bao gồm loại B)
   * Nếu người dùng có dị ứng A, họ cũng nên tránh B
   */
  export const ALLERGY_RELATIONSHIPS: AllergyRelationshipsMap = {
    'Gluten': ['Wheat'],
    'Grain': ['Wheat'],
    'Seafood': ['Shellfish'],
  };
  
  /**
   * Mối quan hệ giữa chế độ ăn và thực phẩm cần tránh
   * Người theo chế độ ăn này nên tránh các loại thực phẩm này
   */
  export const DIET_RESTRICTIONS: DietRestrictionsMap = {
    'Vegetarian': ['Seafood', 'Shellfish'],
    'Vegan': ['Dairy', 'Egg', 'Seafood', 'Shellfish'],
    'Gluten-Free': ['Gluten', 'Wheat'],
    'Dairy-Free': ['Dairy'],
    'Low-Carb': ['Grain', 'Wheat'],
    'Keto': ['Grain', 'Wheat'],
    'Paleo': ['Dairy', 'Grain', 'Wheat', 'Soy', 'Peanut'],
    'Pescatarian': [],
    'Mediterranean': [],
  };
  
  /**
   * Dị ứng chéo có khả năng cao
   * Người dùng nên được cảnh báo về khả năng dị ứng chéo này
   */
  export const CROSS_ALLERGIES: CrossAllergiesMap = {
    'Peanut': ['Tree Nut'],
    'Tree Nut': ['Peanut'],
    'Wheat': ['Gluten'],
  };
  
  /**
   * Checks if a new dietary restriction would conflict with already selected ones
   * 
   * @param currentDiets - Array of currently selected dietary restrictions
   * @param newDiet - New dietary restriction being considered
   * @returns Object containing whether there's a conflict and the name of conflicting diet if any
   */
  export const checkDietaryConflict = (
    currentDiets: string[], 
    newDiet: string
  ): { hasConflict: boolean; conflictingDiet?: string } => {
    console.log(`Checking conflict for new diet: ${newDiet} with current diets:`, currentDiets);
    
    // Check if the diet we're adding conflicts with any current diet
    for (const diet of currentDiets) {
      // Skip checking against itself
      if (diet === newDiet) continue;
      
      // Check if the current diet conflicts with the new diet
      if (DIET_CONFLICTS[diet] && DIET_CONFLICTS[diet].includes(newDiet)) {
        console.log(`Conflict detected: ${diet} conflicts with ${newDiet}`);
        return { hasConflict: true, conflictingDiet: diet };
      }
      
      // Check if the new diet conflicts with the current diet
      if (DIET_CONFLICTS[newDiet] && DIET_CONFLICTS[newDiet].includes(diet)) {
        console.log(`Conflict detected: ${newDiet} conflicts with ${diet}`);
        return { hasConflict: true, conflictingDiet: diet };
      }
    }
    
    // No conflicts found
    console.log(`No conflicts found for ${newDiet}`);
    return { hasConflict: false };
  };
  
  /**
   * Kiểm tra xung đột giữa dị ứng và chế độ ăn
   * Ví dụ: Người dùng dị ứng Seafood không nên chọn chế độ ăn Pescatarian
   * 
   * @param allergies - Danh sách dị ứng của người dùng
   * @param diet - Chế độ ăn đang được xem xét
   * @returns Thông tin về xung đột (nếu có)
   */
  export const checkAllergyDietConflict = (
    allergies: string[],
    diet: string
  ): { hasConflict: boolean; conflictingAllergies: string[] } => {
    console.log(`Checking allergy-diet conflict for diet: ${diet} with allergies:`, allergies);
    
    // Các dị ứng mà chế độ ăn này nên tránh
    const restrictedAllergies = DIET_RESTRICTIONS[diet] || [];
    
    // Kiểm tra xem người dùng có dị ứng nào mâu thuẫn với chế độ ăn không
    const conflictingAllergies = allergies.filter(allergy => {
      // Trường hợp cụ thể: người dị ứng Seafood/Shellfish không nên chọn Pescatarian
      if (diet === 'Pescatarian' && (allergy === 'Seafood' || allergy === 'Shellfish')) {
        return true;
      }
      
      // Các trường hợp khác: kiểm tra xem chế độ ăn có yêu cầu thành phần gây dị ứng không
      return false; // Mặc định không xung đột
    });
    
    if (conflictingAllergies.length > 0) {
      console.log(`Allergy-diet conflict detected for ${diet}:`, conflictingAllergies);
      return { hasConflict: true, conflictingAllergies };
    }
    
    return { hasConflict: false, conflictingAllergies: [] };
  };
  
  /**
   * Kiểm tra dị ứng chéo có thể xảy ra
   * 
   * @param currentAllergies - Danh sách dị ứng hiện tại của người dùng
   * @param newAllergy - Dị ứng mới đang được xem xét
   * @returns Thông tin về dị ứng chéo có thể (nếu có)
   */
  export const checkCrossAllergy = (
    currentAllergies: string[],
    newAllergy: string
  ): { hasCrossAllergy: boolean; crossAllergies: string[] } => {
    // Kiểm tra xem dị ứng mới có khả năng gây dị ứng chéo với các dị ứng khác không
    const possibleCrossAllergies = CROSS_ALLERGIES[newAllergy] || [];
    
    // Lọc ra những dị ứng chéo mà người dùng chưa chọn
    const suggestedCrossAllergies = possibleCrossAllergies.filter(
      allergy => !currentAllergies.includes(allergy)
    );
    
    if (suggestedCrossAllergies.length > 0) {
      console.log(`Possible cross allergies for ${newAllergy}:`, suggestedCrossAllergies);
      return { hasCrossAllergy: true, crossAllergies: suggestedCrossAllergies };
    }
    
    return { hasCrossAllergy: false, crossAllergies: [] };
  };
  
  /**
   * Gets a list of diets that would conflict with the currently selected diets and allergies
   * 
   * @param currentDiets - Array of currently selected dietary restrictions
   * @param allergies - Array of user's allergies
   * @returns Array of diets that would conflict
   */
  export const getConflictingDiets = (
    currentDiets: string[], 
    allergies: string[] = []
  ): string[] => {
    const conflictingDiets = new Set<string>();
    
    // Thêm các chế độ ăn mâu thuẫn dựa trên các chế độ ăn đã chọn
    for (const diet of currentDiets) {
      if (DIET_CONFLICTS[diet]) {
        DIET_CONFLICTS[diet].forEach(conflictDiet => conflictingDiets.add(conflictDiet));
      }
    }
    
    // Thêm các chế độ ăn mâu thuẫn dựa trên dị ứng
    for (const allergy of allergies) {
      // Nếu dị ứng hải sản hoặc động vật có vỏ, không thể theo chế độ Pescatarian
      if (allergy === 'Seafood' || allergy === 'Shellfish') {
        conflictingDiets.add('Pescatarian');
      }
      
      // Nếu dị ứng Dairy, không nên chọn chế độ ăn yêu cầu sữa
      if (allergy === 'Dairy') {
        // Không thêm gì vì chế độ ăn trong danh sách của chúng ta không xung đột trực tiếp với dị ứng sữa
      }
      
      // Nếu dị ứng Gluten/Wheat, không nên chọn các chế độ ăn yêu cầu ngũ cốc
      if (allergy === 'Gluten' || allergy === 'Wheat') {
        // Mediterranean có thể bị hạn chế nhưng không hoàn toàn mâu thuẫn
      }
    }
    
    return Array.from(conflictingDiets);
  };
  
  /**
   * Lấy danh sách các dị ứng gợi ý dựa trên các dị ứng hiện tại và chế độ ăn
   * 
   * @param currentAllergies - Danh sách dị ứng hiện tại
   * @param diets - Danh sách chế độ ăn đã chọn
   * @returns Gợi ý dị ứng nên xem xét
   */
  export const getSuggestedAllergies = (
    currentAllergies: string[],
    diets: string[] = []
  ): { allergySuggestions: string[]; autoSelectAllergies: string[] } => {
    const allergySuggestions = new Set<string>();
    const autoSelectAllergies = new Set<string>();
    
    // Kiểm tra dị ứng chéo
    for (const allergy of currentAllergies) {
      if (CROSS_ALLERGIES[allergy]) {
        CROSS_ALLERGIES[allergy].forEach(crossAllergy => {
          if (!currentAllergies.includes(crossAllergy)) {
            allergySuggestions.add(crossAllergy);
          }
        });
      }
    }
    
    // Kiểm tra mối quan hệ dị ứng (tự động chọn)
    for (const allergy of currentAllergies) {
      if (ALLERGY_RELATIONSHIPS[allergy]) {
        ALLERGY_RELATIONSHIPS[allergy].forEach(relatedAllergy => {
          if (!currentAllergies.includes(relatedAllergy)) {
            autoSelectAllergies.add(relatedAllergy);
          }
        });
      }
    }
    
    // Dựa vào chế độ ăn để đề xuất
    for (const diet of diets) {
      if (DIET_RESTRICTIONS[diet]) {
        // Nếu chế độ ăn yêu cầu tránh một số thực phẩm, đề xuất chúng làm dị ứng
        DIET_RESTRICTIONS[diet].forEach(restriction => {
          // Chỉ đề xuất (không tự động chọn) những thực phẩm cần tránh theo chế độ ăn
          if (!currentAllergies.includes(restriction)) {
            allergySuggestions.add(restriction);
          }
        });
      }
    }
    
    return {
      allergySuggestions: Array.from(allergySuggestions),
      autoSelectAllergies: Array.from(autoSelectAllergies)
    };
  };