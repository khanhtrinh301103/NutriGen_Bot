// frontend/src/pages/adminUI/components/AdminDashboardCharts.tsx
import React from 'react';
import GridLayout from 'react-grid-layout';

import { 
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg p-4 h-full w-full">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <div className="h-[260px]">{children}</div>
  </div>
);

const AdminDashboardCharts: React.FC<AdminDashboardChartsProps> = ({
  genderRatio,
  healthGoals,
  activityLevels,
  topDietaryRestrictions,
  topAllergies
}) => {
  const layout = [
    { i: 'gender', x: 0, y: 0, w: 1, h: 2 },
    { i: 'health', x: 1, y: 0, w: 1, h: 2 },
    { i: 'activity', x: 2, y: 0, w: 1, h: 2 },
    { i: 'dietary', x: 0, y: 2, w: 2, h: 2 },
    { i: 'allergies', x: 2, y: 2, w: 1, h: 2 },
  ];

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={3}
      rowHeight={150}
      width={1200}
      isResizable={true}
      isDraggable={true}
    >
      <div key="gender">
        <ChartCard title="Gender Ratio">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={genderRatio} dataKey="value" nameKey="name" outerRadius={80} label={renderCustomizedLabel}>
                {genderRatio.map((entry, index) => (
                  <Cell key={`cell-gender-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div key="health">
        <ChartCard title="Health Goals">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={healthGoals} dataKey="value" nameKey="name" outerRadius={80} label={renderCustomizedLabel}>
                {healthGoals.map((entry, index) => (
                  <Cell key={`cell-goals-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div key="activity">
        <ChartCard title="Activity Levels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityLevels} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}`} />
              <Bar dataKey="value" name="Users">
                {activityLevels.map((entry, index) => (
                  <Cell key={`cell-activity-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div key="dietary">
        <ChartCard title="Top 5 Dietary Restrictions">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topDietaryRestrictions} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}`} />
              <Bar dataKey="value" name="Users">
                {topDietaryRestrictions.map((entry, index) => (
                  <Cell key={`cell-dietary-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {topAllergies && topAllergies.length > 0 && (
        <div key="allergies">
          <ChartCard title="Top 5 Allergies">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAllergies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value}`} />
                <Bar dataKey="value" name="Users">
                  {topAllergies.map((entry, index) => (
                    <Cell key={`cell-allergy-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </GridLayout>
  );
};

export default AdminDashboardCharts;