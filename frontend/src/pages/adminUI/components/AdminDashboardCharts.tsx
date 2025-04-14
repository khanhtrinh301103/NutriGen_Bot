// frontend/src/pages/adminUI/components/AdminDashboardCharts.tsx
import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS_PIE = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#FF6699', '#FF33A8', '#AAEE22', '#AA22EE'
];

const COLORS_BAR = [
  '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', 
  '#a4de6c', '#fa8072', '#ffd700', '#20b2aa'
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy  + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface ChartData {
  name: string;
  value: number;
}

interface AdminDashboardChartsProps {
  genderRatio: ChartData[];
  healthGoals: ChartData[];
  activityLevels: ChartData[];
  topDietaryRestrictions: ChartData[];
  topAllergies?: ChartData[];
}

const AdminDashboardCharts: React.FC<AdminDashboardChartsProps> = ({
  genderRatio,
  healthGoals,
  activityLevels,
  topDietaryRestrictions,
  topAllergies
}) => {
  const totalGender = genderRatio.reduce((sum, item) => sum + item.value, 0);
  const totalHealthGoals = healthGoals.reduce((sum, item) => sum + item.value, 0);
  const totalDietary = topDietaryRestrictions.reduce((sum, item) => sum + item.value, 0);
  const totalAllergies = topAllergies ? topAllergies.reduce((sum, item) => sum + item.value, 0) : 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Chart 1: Male / Female Ratio */}
        <div className="bg-white shadow-md rounded-lg p-6 min-h-[340px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Male / Female Ratio</h3>
          {totalGender > 0 ? (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderRatio}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label={renderCustomizedLabel}
                  >
                    {genderRatio.map((entry, index) => (
                      <Cell key={`cell-gender-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center flex-1 text-gray-500">No Gender Data Available</div>
          )}
        </div>

        {/* Chart 2: Health Goals Distribution */}
        <div className="bg-white shadow-md rounded-lg p-6 min-h-[340px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Health Goals Distribution</h3>
          {totalHealthGoals > 0 ? (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthGoals}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label={renderCustomizedLabel}
                  >
                    {healthGoals.map((entry, index) => (
                      <Cell key={`cell-goals-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center flex-1 text-gray-500">No Health Goals Data Available</div>
          )}
        </div>

        {/* Chart 3: Popular Activity Levels */}
        <div className="bg-white shadow-md rounded-lg p-6 min-h-[340px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Popular Activity Levels</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityLevels} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}`} />
                <Legend />
                <Bar dataKey="value" name="Users">
                  {activityLevels.map((entry, index) => (
                    <Cell key={`cell-activity-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top 5 Dietary Restrictions (Horizontal Bar Chart) */}
        <div className="bg-white shadow-md rounded-lg p-6 min-h-[340px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 5 Dietary Restrictions</h3>
          {totalDietary > 0 ? (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDietaryRestrictions} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax + 1']} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend />
                  <Bar dataKey="value" name="Users">
                    {topDietaryRestrictions.map((entry, index) => (
                      <Cell key={`cell-dietary-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center flex-1 text-gray-500">No Dietary Restrictions Data</div>
          )}
        </div>
      </div>

      {/* Full-width chart cho Top 5 Allergies */}
      <div className="bg-white shadow-md rounded-lg p-6 min-h-[340px] mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 5 Allergies</h3>
        {topAllergies && topAllergies.length > 0 && totalAllergies > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topAllergies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* Sử dụng trục X hiển thị tên allergy */}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
              <Bar dataKey="value" name="Users">
                {topAllergies.map((entry, index) => (
                  <Cell key={`cell-allergy-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-40 text-gray-500">
            No Allergies Data
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardCharts;
