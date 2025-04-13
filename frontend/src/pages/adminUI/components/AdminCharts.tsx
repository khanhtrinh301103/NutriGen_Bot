// frontend/src/pages/adminUI/components/AdminCharts.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface UserTrendDataPoint {
  date: string;
  count: number;
}

interface PieDataPoint {
  name: string;
  value: number;
}

interface PopularKeyword {
  term: string;
  count: number;
}

interface AdminChartsProps {
  userTrendData: UserTrendDataPoint[];
  recipeSearchTrendData: UserTrendDataPoint[]; // Dữ liệu xu hướng tìm kiếm recipes (7 ngày)
  userRoleData: PieDataPoint[];
  popularKeywords?: PopularKeyword[];
}

// Mảng màu cho các cột của biểu đồ Popular Keywords
const BAR_COLORS = ['#4ade80', '#fb7185', '#60a5fa', '#f59e0b', '#8b5cf6', '#34d399', '#f472b6'];

const AdminCharts: React.FC<AdminChartsProps> = ({
  userTrendData,
  recipeSearchTrendData,
  userRoleData,
  popularKeywords
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Analytics Dashboard</h2>
      
      {/* User Registration Trend */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700">User Registration Trend (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="New Users" stroke="#4ade80" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recipe Searches Trend */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Recipe Searches Trend (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recipeSearchTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Searches" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* User Role Distribution */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700">User Role Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userRoleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} users`, '']} />
              <Legend />
              <Bar dataKey="value" name="Users" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Popular Keywords Analysis */}
      {popularKeywords && popularKeywords.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mt-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Popular Keywords</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularKeywords} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="term" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Search Count">
                  {popularKeywords.map((entry, index) => (
                    <Cell key={`cell-popular-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminCharts;
