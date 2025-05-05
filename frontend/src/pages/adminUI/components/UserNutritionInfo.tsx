// frontend/src/pages/adminUI/components/UserNutritionInfo.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UserNutritionInfoProps {
  nutrition: any;
}

const UserNutritionInfo: React.FC<UserNutritionInfoProps> = ({ nutrition }) => {
  if (!nutrition) return <div className="text-center p-4">No nutrition data available</div>;
  
  const basicNutritionItems = [
    { label: 'BMR (Basal Metabolic Rate)', value: `${nutrition.bmr || 0} calories` },
    { label: 'TDEE (Total Daily Energy Expenditure)', value: `${nutrition.tdee || 0} calories` },
    { label: 'Target Daily Calories', value: `${nutrition.targetCalories || 0} calories` },
    { label: 'Calories Per Meal', value: `${nutrition.caloriesPerMeal || 0} calories` },
  ];
  
  const macroItems = [
    { 
      label: 'Daily Protein', 
      value: `${nutrition.dailyProtein || 0}g`,
      perMeal: `${nutrition.proteinPerMeal || 0}g per meal`,
      color: 'bg-blue-500'
    },
    { 
      label: 'Daily Carbs', 
      value: `${nutrition.dailyCarbs || 0}g`,
      perMeal: `${nutrition.carbsPerMeal || 0}g per meal`,
      color: 'bg-green-500'
    },
    { 
      label: 'Daily Fat', 
      value: `${nutrition.dailyFat || 0}g`,
      perMeal: `${nutrition.fatPerMeal || 0}g per meal`,
      color: 'bg-yellow-500'
    },
  ];
  
  // Calculate macronutrients percentage
  const totalMacros = (nutrition.dailyProtein || 0) + (nutrition.dailyCarbs || 0) + (nutrition.dailyFat || 0);
  const proteinPercentage = totalMacros > 0 ? Math.round((nutrition.dailyProtein || 0) / totalMacros * 100) : 0;
  const carbsPercentage = totalMacros > 0 ? Math.round((nutrition.dailyCarbs || 0) / totalMacros * 100) : 0;
  const fatPercentage = totalMacros > 0 ? Math.round((nutrition.dailyFat || 0) / totalMacros * 100) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculated Nutrition</CardTitle>
        <CardDescription>User's calculated nutritional requirements.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {basicNutritionItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b last:border-b-0">
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-sm md:col-span-2">{item.value}</div>
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Macronutrients Distribution</h3>
          
          <div className="h-4 w-full rounded-full overflow-hidden bg-gray-100 flex">
            <div className="h-full bg-blue-500" style={{ width: `${proteinPercentage}%` }}></div>
            <div className="h-full bg-green-500" style={{ width: `${carbsPercentage}%` }}></div>
            <div className="h-full bg-yellow-500" style={{ width: `${fatPercentage}%` }}></div>
          </div>
          
          <div className="flex justify-between text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Protein {proteinPercentage}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Carbs {carbsPercentage}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>Fat {fatPercentage}%</span>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            {macroItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
                <Progress value={index === 0 ? proteinPercentage : index === 1 ? carbsPercentage : fatPercentage} className={`h-2 ${item.color}`} />
                <div className="text-xs text-muted-foreground">{item.perMeal}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default UserNutritionInfo;