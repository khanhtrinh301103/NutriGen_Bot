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
  PieChart,
  Pie,
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

interface AdminChartsProps {
  userTrendData: UserTrendDataPoint[];
  userStatusData: PieDataPoint[];
  userRoleData: PieDataPoint[];
}

const COLORS = ['#4ade80', '#fb7185', '#60a5fa', '#f59e0b', '#8b5cf6'];

const AdminCharts: React.FC<AdminChartsProps> = ({ userTrendData, userStatusData, userRoleData }) => {
  // Format percentage for the pie chart tooltip
  const renderCustomizedLabel = (entry: any) => {
    const percent = Math.round((entry.percent) * 100);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Analytics Dashboard</h2>
      
      {/* User Registration Trend */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700">User Registration Trend (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={userTrendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="New Users" 
                stroke="#4ade80" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-700">User Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} users`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* User Role Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-700">User Role Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} users`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;