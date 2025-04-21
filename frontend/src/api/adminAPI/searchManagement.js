// frontend/src/api/adminAPI/searchManagement.js
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Lấy thông tin tất cả tìm kiếm từ Firestore để phân tích
 * @returns {Promise<Array>} Danh sách lịch sử tìm kiếm của tất cả người dùng
 */
export const getAllSearchHistory = async () => {
  try {
    console.log("📊 [Admin] Fetching all search history data");
    
    const searchHistoryRef = collection(db, "search_history");
    const searchSnapshots = await getDocs(searchHistoryRef);
    
    let allSearches = [];
    
    // Duyệt qua mỗi document và trích xuất lịch sử tìm kiếm
    searchSnapshots.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Chỉ xử lý nếu có mảng searches
      if (userData && userData.searches && Array.isArray(userData.searches)) {
        // Thêm userId vào mỗi mục tìm kiếm
        const userSearches = userData.searches.map(search => ({
          ...search,
          userId: userId
        }));
        
        allSearches = [...allSearches, ...userSearches];
      }
    });
    
    // Sắp xếp theo thời gian giảm dần (mới nhất trước)
    allSearches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log(`✅ [Admin] Retrieved ${allSearches.length} search records`);
    return allSearches;
  } catch (error) {
    console.error("❌ [Admin] Error fetching search history:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết người dùng dựa trên userId
 * @param {string} userId - ID của người dùng cần lấy thông tin
 * @returns {Promise<Object>} Thông tin chi tiết của người dùng
 */
export const getUserDetails = async (userId) => {
  try {
    console.log(`🔍 [Admin] Fetching user details for userId: ${userId}`);
    
    const userRef = doc(db, "user", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log(`✅ [Admin] Found user: ${userData.fullName || userId}`);
      return userData;
    } else {
      console.log(`⚠️ [Admin] User not found: ${userId}`);
      return { fullName: "Unknown User" };
    }
  } catch (error) {
    console.error(`❌ [Admin] Error fetching user details for ${userId}:`, error);
    return { fullName: "Unknown User" };
  }
};

/**
 * Lấy lịch sử tìm kiếm theo khoảng thời gian
 * @param {Date} startDate - Ngày bắt đầu khoảng thời gian
 * @param {Date} endDate - Ngày kết thúc khoảng thời gian
 * @returns {Promise<Array>} Danh sách lịch sử tìm kiếm trong khoảng thời gian
 */
export const getSearchHistoryByDateRange = async (startDate, endDate) => {
  try {
    console.log(`📅 [Admin] Fetching search history from ${startDate} to ${endDate}`);
    
    // Lấy tất cả lịch sử tìm kiếm
    const allSearchHistory = await getAllSearchHistory();
    
    // Lọc theo khoảng thời gian
    const filteredHistory = allSearchHistory.filter(search => {
      const searchDate = new Date(search.timestamp);
      return searchDate >= startDate && searchDate <= endDate;
    });
    
    console.log(`✅ [Admin] Found ${filteredHistory.length} searches in selected date range`);
    return filteredHistory;
  } catch (error) {
    console.error("❌ [Admin] Error fetching search history by date range:", error);
    throw error;
  }
};

/**
 * Phân tích từ khóa tìm kiếm phổ biến nhất
 * @param {Array} searchData - Dữ liệu lịch sử tìm kiếm
 * @param {number} limit - Số lượng từ khóa muốn lấy
 * @returns {Array} Danh sách từ khóa phổ biến nhất kèm số lần tìm kiếm
 */
export const getTopSearchKeywords = (searchData, topLimit = 10) => {
  console.log(`📈 [Admin] Analyzing top ${topLimit} search keywords`);
  
  // Đếm số lần xuất hiện của mỗi từ khóa
  const keywordCounts = searchData.reduce((acc, search) => {
    const term = search.term.toLowerCase();
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {});
  
  // Chuyển đổi thành mảng và sắp xếp
  const sortedKeywords = Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topLimit);
  
  console.log(`✅ [Admin] Top search keyword: "${sortedKeywords[0]?.keyword || 'none'}" with ${sortedKeywords[0]?.count || 0} searches`);
  return sortedKeywords;
};

/**
 * Phân tích số lượng tìm kiếm theo ngày
 * @param {Array} searchData - Dữ liệu lịch sử tìm kiếm
 * @returns {Array} Số lượng tìm kiếm theo từng ngày
 */
export const getSearchesByDay = (searchData) => {
  console.log("📊 [Admin] Analyzing search volume by day");
  
  // Nhóm tìm kiếm theo ngày
  const searchesByDay = searchData.reduce((acc, search) => {
    // Chuyển timestamp thành ngày (không có giờ, phút, giây)
    const searchDate = new Date(search.timestamp);
    const dateString = searchDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    acc[dateString] = (acc[dateString] || 0) + 1;
    return acc;
  }, {});
  
  // Chuyển đổi thành mảng để hiển thị trên biểu đồ
  const result = Object.entries(searchesByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sắp xếp theo ngày tăng dần
  
  console.log(`✅ [Admin] Analyzed searches by day for ${result.length} days`);
  return result;
};

/**
 * Phân tích bộ lọc được sử dụng nhiều nhất
 * @param {Array} searchData - Dữ liệu lịch sử tìm kiếm
 * @returns {Array} Danh sách bộ lọc kèm số lần sử dụng
 */
export const getTopFilters = (searchData) => {
  console.log("🔍 [Admin] Analyzing top filters usage");
  
  // Tập hợp tất cả loại bộ lọc
  const allFilters = [];
  searchData.forEach(search => {
    if (search.filters) {
      // Bổ sung tất cả các bộ lọc đã sử dụng
      Object.entries(search.filters).forEach(([filterType, value]) => {
        if (value && value.trim() !== '') {
          allFilters.push({ type: filterType, value });
        }
      });
    }
  });
  
  // Đếm số lần sử dụng của mỗi loại bộ lọc
  const filterCounts = allFilters.reduce((acc, filter) => {
    const filterKey = `${filter.type}:${filter.value}`;
    acc[filterKey] = (acc[filterKey] || 0) + 1;
    return acc;
  }, {});
  
  // Chuyển đổi thành mảng và sắp xếp
  const sortedFilters = Object.entries(filterCounts)
    .map(([filterKey, count]) => {
      const [type, value] = filterKey.split(':');
      return { type, value, count };
    })
    .sort((a, b) => b.count - a.count);
  
  console.log(`✅ [Admin] Analyzed ${sortedFilters.length} unique filters`);
  return sortedFilters;
};

/**
 * Phân tích thời gian cao điểm người dùng tìm kiếm
 * @param {Array} searchData - Dữ liệu lịch sử tìm kiếm
 * @returns {Array} Số lượng tìm kiếm theo từng giờ trong ngày
 */
export const getPeakHours = (searchData) => {
  console.log("⏰ [Admin] Analyzing peak hours for searches");
  
  // Khởi tạo mảng đếm cho 24 giờ trong ngày
  const hourCounts = Array(24).fill(0);
  
  // Đếm số lần tìm kiếm trong mỗi giờ
  searchData.forEach(search => {
    const searchTime = new Date(search.timestamp);
    const hour = searchTime.getHours();
    hourCounts[hour]++;
  });
  
  // Chuyển đổi thành mảng để hiển thị trên biểu đồ
  const result = hourCounts.map((count, hour) => ({
    hour: hour.toString().padStart(2, '0') + ':00',
    count
  }));
  
  // Tìm giờ cao điểm
  const peakHour = result.reduce(
    (max, current) => (current.count > max.count ? current : max),
    { hour: '00:00', count: 0 }
  );
  
  console.log(`✅ [Admin] Peak hour identified: ${peakHour.hour} with ${peakHour.count} searches`);
  return result;
};

/**
 * Chuẩn bị dữ liệu cho bảng hiển thị
 * @param {Array} searchData - Dữ liệu lịch sử tìm kiếm
 * @param {number} resultLimit - Số lượng kết quả tối đa
 * @returns {Promise<Array>} Dữ liệu đã được định dạng cho bảng
 */
export const prepareTableData = async (searchData, resultLimit = 20) => {
  console.log(`📋 [Admin] Preparing table data (limit: ${resultLimit})`);
  
  // Lấy dữ liệu mới nhất
  const recentSearches = searchData.slice(0, resultLimit);
  
  // Tạo bảng tra cứu để lưu trữ thông tin người dùng
  const userLookup = {};
  
  // Tạo danh sách các userId duy nhất
  const uniqueUserIds = [...new Set(recentSearches.map(search => search.userId))];
  
  // Lấy thông tin người dùng theo batch để tránh quá nhiều lệnh gọi Firestore
  for (const userId of uniqueUserIds) {
    if (!userLookup[userId]) {
      userLookup[userId] = await getUserDetails(userId);
    }
  }
  
  // Định dạng dữ liệu cho bảng
  const tableData = recentSearches.map(search => {
    const user = userLookup[search.userId] || { fullName: "Unknown User" };
    
    // Tạo chuỗi bộ lọc để hiển thị
    let filterString = "";
    if (search.filters) {
      filterString = Object.entries(search.filters)
        .filter(([key, value]) => value && value.trim() !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    // Định dạng thời gian
    const searchDate = new Date(search.timestamp);
    const formattedTime = searchDate.toLocaleString();
    
    return {
      id: search.id || search.userId + '-' + searchDate.getTime(),
      user: user.fullName,
      userId: search.userId,
      term: search.term,
      filters: filterString || "None",
      rawFilters: search.filters || {},
      timestamp: formattedTime,
      rawTimestamp: search.timestamp
    };
  });
  
  console.log(`✅ [Admin] Prepared ${tableData.length} rows for display`);
  return tableData;
};

/**
 * Tạo dữ liệu mẫu cho việc demo nếu không có dữ liệu thật
 * @param {number} sampleSize - Số lượng mẫu cần tạo
 * @returns {Array} Dữ liệu mẫu cho tìm kiếm
 */
export const generateMockSearchData = (sampleSize = 200) => {
  console.log(`🔄 [Admin] Generating ${sampleSize} mock search records`);
  
  const mockUsers = [
    { id: 'user1', fullName: 'John Smith' },
    { id: 'user2', fullName: 'Emma Johnson' },
    { id: 'user3', fullName: 'Michael Brown' },
    { id: 'user4', fullName: 'Sophia Williams' },
    { id: 'user5', fullName: 'William Davis' },
    { id: 'LwkuRa2l09QuvphvxlWcn1MSE3I2', fullName: 'Khanh Trinh' }
  ];
  
  const searchTerms = [
    'chicken', 'beef', 'pasta', 'salad', 'soup', 
    'vegetarian', 'breakfast', 'dessert', 'fish',
    'quick meal', 'slow cooker', 'keto', 'low carb',
    'gluten free', 'vegan', 'asian', 'italian',
    'mexican', 'healthy', 'sandwich'
  ];
  
  const cuisines = [
    'Italian', 'Asian', 'Mexican', 'French', 'Indian',
    'Mediterranean', 'American', 'Middle Eastern', 'Greek',
    'Japanese', 'Thai', 'Spanish', 'Korean', 'Vietnamese'
  ];
  
  // Tạo mốc thời gian trong vòng 30 ngày qua
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Tạo dữ liệu mẫu
  const mockData = [];
  
  for (let i = 0; i < sampleSize; i++) {
    // Chọn ngẫu nhiên người dùng
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    // Chọn ngẫu nhiên từ khóa tìm kiếm
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    // Thêm bộ lọc ngẫu nhiên (hoặc không có)
    const filters = {};
    if (Math.random() > 0.3) { // 70% cơ hội có bộ lọc cuisine
      filters.cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    }
    
    // Tạo ngẫu nhiên thời gian trong khoảng 30 ngày qua
    const randomTime = new Date(
      thirtyDaysAgo.getTime() + 
      Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
    );
    
    // Thêm vào mẫu dữ liệu
    mockData.push({
      id: `mock-${i}`,
      userId: randomUser.id,
      term: randomTerm,
      filters: filters,
      timestamp: randomTime.toISOString()
    });
  }
  
  // Sắp xếp theo thời gian giảm dần (mới nhất trước)
  mockData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  console.log(`✅ [Admin] Generated ${mockData.length} mock search records`);
  return mockData;
};

/**
 * Hàm chính kết hợp để lấy và phân tích dữ liệu tìm kiếm
 * @param {Date} startDate - Ngày bắt đầu khoảng thời gian (tùy chọn)
 * @param {Date} endDate - Ngày kết thúc khoảng thời gian (tùy chọn)
 * @param {boolean} useMockData - Có sử dụng dữ liệu mẫu hay không
 * @returns {Promise<Object>} Dữ liệu đã phân tích
 */
export const getSearchAnalytics = async (startDate = null, endDate = null, useMockData = false) => {
  try {
    console.log("🔎 [Admin] Fetching search analytics data");
    
    // Lấy dữ liệu tìm kiếm (thật hoặc mẫu)
    let searchData;
    if (useMockData) {
      console.log("🔄 [Admin] Using mock data for development");
      searchData = generateMockSearchData(200);
    } else {
      // Lấy dữ liệu thật từ Firestore
      console.log("📊 [Admin] Fetching real data from Firestore");
      searchData = await getAllSearchHistory();
      
      // Chỉ sử dụng dữ liệu mẫu nếu không có dữ liệu thật và được yêu cầu rõ ràng
      if (!searchData || searchData.length === 0) {
        console.log("⚠️ [Admin] No real search data found");
        // Không tự động chuyển sang dữ liệu mẫu nữa
      }
    }
    
    // Phân tích dữ liệu nếu có, nếu không thì trả về kết quả trống
    if (searchData && searchData.length > 0) {
      // Lọc theo khoảng thời gian nếu được chỉ định
      if (startDate && endDate) {
        console.log(`🔍 [Admin] Filtering by date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        
        // Tạo bản sao của endDate và điều chỉnh thành cuối ngày (23:59:59.999)
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        
        console.log(`🔍 [Admin] Adjusted end date to end of day: ${adjustedEndDate.toISOString()}`);
        
        searchData = searchData.filter(search => {
          const searchDate = new Date(search.timestamp);
          const isInRange = searchDate >= startDate && searchDate <= adjustedEndDate;
          
          // Log để debug
          if (isInRange) {
            console.log(`✅ [Admin] Including search: ${search.term} at ${searchDate.toISOString()}`);
          }
          
          return isInRange;
        });
        
        console.log(`🔢 [Admin] Found ${searchData.length} searches in date range`);
      }
      
      // Phân tích dữ liệu
      const topKeywords = getTopSearchKeywords(searchData);
      const searchesByDay = getSearchesByDay(searchData);
      const topFilters = getTopFilters(searchData);
      const peakHours = getPeakHours(searchData);
      const tableData = await prepareTableData(searchData);
      
      // Tổng hợp kết quả
      const analyticsData = {
        topKeywords,
        searchesByDay,
        topFilters,
        peakHours,
        tableData,
        totalSearches: searchData.length,
        uniqueUsers: new Set(searchData.map(s => s.userId)).size
      };
      
      console.log("✅ [Admin] Search analytics data prepared successfully");
      return analyticsData;
    } else {
      // Trả về kết quả trống khi không có dữ liệu
      console.log("ℹ️ [Admin] No search data available");
      return {
        topKeywords: [],
        searchesByDay: [],
        topFilters: [],
        peakHours: [],
        tableData: [],
        totalSearches: 0,
        uniqueUsers: 0
      };
    }
    
  } catch (error) {
    console.error("❌ [Admin] Error generating search analytics:", error);
    
    // Trả về kết quả trống thay vì sử dụng dữ liệu mẫu khi có lỗi
    console.log("⚠️ [Admin] Returning empty data due to error");
    return {
      topKeywords: [],
      searchesByDay: [],
      topFilters: [],
      peakHours: [],
      tableData: [],
      totalSearches: 0,
      uniqueUsers: 0,
      isError: true
    };
  }
};

// Export các hàm để sử dụng trong component UI
export default {
  getSearchAnalytics,
  getSearchHistoryByDateRange,
  generateMockSearchData
};