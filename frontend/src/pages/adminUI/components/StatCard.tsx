// frontend/src/pages/adminUI/components/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatCard;
