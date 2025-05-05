// frontend/src/pages/adminUI/components/StatCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  trend = 'neutral',
  icon,
  className = '' 
}) => {
  console.log(`📊 [StatCard] Rendering stat card: ${title} - ${value}`);
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {trend === 'up' && <ChevronUp className="h-4 w-4 text-green-500 mr-1" />}
            {trend === 'down' && <ChevronDown className="h-4 w-4 text-red-500 mr-1" />}
            {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-500 mr-1" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default StatCard;