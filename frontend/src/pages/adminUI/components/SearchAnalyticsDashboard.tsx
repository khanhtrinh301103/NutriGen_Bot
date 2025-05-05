// frontend/src/pages/adminUI/components/SearchAnalyticsDashboard.tsx
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Sector, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

interface SearchAnalyticsDashboardProps {
  analytics: {
    topKeywords: Array<{ keyword: string; count: number }>;
    searchesByDay: Array<{ date: string; count: number }>;
    topFilters: Array<{ type: string; value: string; count: number }>;
    peakHours: Array<{ hour: string; count: number }>;
    totalSearches: number;
    uniqueUsers: number;
  };
  isLoading: boolean;
}

// Custom tooltip for charts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  valuePrefix = "", 
  valueSuffix = "" 
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-600">{`${label}`}</p>
        <p className="text-green-600">
          {`${valuePrefix}${payload[0].value}${valueSuffix}`}
        </p>
      </div>
    );
  }
  return null;
};

const SearchAnalyticsDashboard: React.FC<SearchAnalyticsDashboardProps> = ({ analytics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="w-full h-80 animate-pulse bg-gray-100">
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  // Kiểm tra nếu không có dữ liệu
  const hasNoData = 
    !analytics.topKeywords?.length && 
    !analytics.searchesByDay?.length && 
    !analytics.topFilters?.length && 
    !analytics.peakHours?.length;
    
  if (hasNoData) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="w-full p-8">
          <div className="h-full flex flex-col items-center justify-center text-center">
            <svg
              className="h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No search data available</h3>
            <p className="text-gray-500 mb-4">
              There is no search history data to display. User search activity will appear here once available.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ top từ khóa
  const keywordData = [...analytics.topKeywords].slice(0, 10);

  // Chuẩn bị dữ liệu cho biểu đồ tròn (bộ lọc)
  const filterData = analytics.topFilters
    .slice(0, 8)
    .map(filter => ({
      name: `${filter.type}: ${filter.value}`,
      value: filter.count
    }));

  const FILTER_COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
    '#82ca9d', '#ffc658', '#8dd1e1'
  ];

  // Format dữ liệu cho active hours
  const hourlyData = [...analytics.peakHours];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
      {/* Searches Over Time Chart */}
      <Card className="w-full h-80">
        <CardHeader className="pb-2">
          <CardTitle>Search Volume by Day</CardTitle>
          <CardDescription>Number of searches performed each day</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analytics.searchesByDay}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth()+1}/${d.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip valueSuffix=" searches" />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Searches" 
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Keywords Chart */}
      <Card className="w-full h-80">
        <CardHeader className="pb-2">
          <CardTitle>Top Search Keywords</CardTitle>
          <CardDescription>Most frequently searched terms</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={keywordData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="keyword" 
                type="category" 
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip valueSuffix=" searches" />} />
              <Legend />
              <Bar dataKey="count" name="Search Count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Peak Hours Chart */}
      <Card className="w-full h-80">
        <CardHeader className="pb-2">
          <CardTitle>Peak Search Hours</CardTitle>
          <CardDescription>When users are most active</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hourlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip content={<CustomTooltip valueSuffix=" searches" />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Searches" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Filters Pie Chart */}
      <Card className="w-full h-80">
        <CardHeader className="pb-2">
          <CardTitle>Most Used Filters</CardTitle>
          <CardDescription>Popular cuisine and filters</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                isAnimationActive={true}
                data={filterData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {filterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FILTER_COLORS[index % FILTER_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} searches`, 'Count']} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right" 
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default SearchAnalyticsDashboard;