// frontend/src/pages/adminUI/SearchManagement.tsx
import React, { useState, useEffect } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import DateRangePicker from './components/DateRangePicker';
import SearchStatCards from './components/SearchStatCards';
import SearchAnalyticsDashboard from './components/SearchAnalyticsDashboard';
import SearchHistoryTable from './components/SearchHistoryTable';
import { addDays, subDays } from 'date-fns';

// Import service cho phân tích tìm kiếm
import { getSearchAnalytics } from '../../api/adminAPI/searchManagement';

const SearchManagement = () => {
  // State cho dữ liệu phân tích
  const [analyticsData, setAnalyticsData] = useState({
    topKeywords: [],
    searchesByDay: [],
    topFilters: [],
    peakHours: [],
    tableData: [],
    totalSearches: 0,
    uniqueUsers: 0
  });
  
  // State cho bộ lọc ngày
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  
  // State cho trạng thái loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Tải dữ liệu phân tích khi component mount hoặc khi áp dụng bộ lọc
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      
      try {
        console.log("📊 [Admin] Loading search analytics data");
        
        // Xác định tham số truyền vào API
        const params: [Date | null, Date | null, boolean] = [
          isDateFiltered && startDate ? startDate : null,
          isDateFiltered && endDate ? endDate : null,
          false // Sử dụng dữ liệu thực tế từ Firestore
        ];
        
        // Gọi API để lấy dữ liệu phân tích
        const data = await getSearchAnalytics(...params);
        setAnalyticsData(data);
        
        console.log(`✅ [Admin] Loaded search data: ${data.totalSearches} searches from ${data.uniqueUsers} users`);
      } catch (error) {
        console.error("❌ [Admin] Error loading search analytics:", error);
      } finally {
        // Trì hoãn việc tắt trạng thái loading để tạo hiệu ứng mượt mà hơn
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    fetchAnalyticsData();
  }, [isDateFiltered, startDate, endDate]);
  
  // Xử lý áp dụng bộ lọc ngày
  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      console.log(`🔍 [Admin] Applying date filter: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Đảm bảo giờ của startDate là đầu ngày
      const adjustedStartDate = new Date(startDate);
      adjustedStartDate.setHours(0, 0, 0, 0);
      setStartDate(adjustedStartDate);
      
      // Đảm bảo giờ của endDate là cuối ngày
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      setEndDate(adjustedEndDate);
      
      setIsDateFiltered(true);
    }
  };
  
  // Xử lý reset bộ lọc ngày
  const handleResetDateFilter = () => {
    console.log("🔄 [Admin] Resetting date filter");
    setStartDate(undefined);
    setEndDate(undefined);
    setIsDateFiltered(false);
  };
  
  // Tạo các preset phổ biến cho bộ lọc
  const applyLast7Days = () => {
    const end = new Date();
    const start = subDays(end, 6); // 7 ngày (bao gồm hôm nay)
    setStartDate(start);
    setEndDate(end);
    setIsDateFiltered(true);
  };
  
  const applyLast30Days = () => {
    const end = new Date();
    const start = subDays(end, 29); // 30 ngày (bao gồm hôm nay)
    setStartDate(start);
    setEndDate(end);
    setIsDateFiltered(true);
  };
  
  return (
    <AdminRoute>
      <AdminLayout title="Search Behavior Analytics">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Tiêu đề và mô tả */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Analyze user search patterns to understand what users are looking for and optimize content accordingly.</h1>
            </div>
            
            {/* Preset buttons */}
            <div className="flex space-x-2 mb-4">
              <button 
                onClick={applyLast7Days}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Last 7 Days
              </button>
              <button 
                onClick={applyLast30Days}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Last 30 Days
              </button>
            </div>
            
            {/* Date Picker */}
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onApplyFilter={handleApplyDateFilter}
              onResetFilter={handleResetDateFilter}
              isFiltered={isDateFiltered}
            />
            
            {/* Stat Cards */}
            <div className="mt-6">
              <SearchStatCards 
                totalSearches={analyticsData.totalSearches}
                uniqueUsers={analyticsData.uniqueUsers}
                topKeyword={analyticsData.topKeywords[0]?.keyword || 'N/A'}
                topKeywordCount={analyticsData.topKeywords[0]?.count || 0}
                dateRange={{
                  start: startDate,
                  end: endDate
                }}
                isLoading={isLoading}
              />
            </div>
            
            {/* Charts Dashboard */}
            <SearchAnalyticsDashboard 
              analytics={analyticsData}
              isLoading={isLoading}
            />
            
            {/* Search History Table */}
            <SearchHistoryTable 
              tableData={analyticsData.tableData || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default SearchManagement;