// frontend/src/pages/adminUI/components/UserHealthProfile.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserHealthProfileProps {
  healthProfile: any;
}

const UserHealthProfile: React.FC<UserHealthProfileProps> = ({ healthProfile }) => {
  if (!healthProfile) return <div className="text-center p-4">No health profile data available</div>;
  
  const basicInfoItems = [
    { label: 'Gender', value: healthProfile.gender || 'Not specified' },
    { label: 'Age', value: healthProfile.age || 'Not specified' },
    { label: 'Height (cm)', value: healthProfile.height || 'Not specified' },
    { label: 'Weight (kg)', value: healthProfile.weight || 'Not specified' },
    { label: 'Activity Level', value: healthProfile.activityLevel || 'Not specified' },
    { label: 'Goal', value: healthProfile.goal || 'Not specified' },
    { label: 'Meals Per Day', value: healthProfile.mealsPerDay || '3' },
    { label: 'Macro Distribution', value: healthProfile.macroDistribution || 'Balanced' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Profile</CardTitle>
        <CardDescription>User's health and nutrition information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {basicInfoItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b last:border-b-0">
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-sm md:col-span-2">{item.value}</div>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b">
            <div className="font-medium text-sm">Allergies</div>
            <div className="md:col-span-2">
              {healthProfile.allergies && healthProfile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {healthProfile.allergies.map((allergy: string, index: number) => (
                    <Badge key={index} variant="outline">{allergy}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm">No allergies</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2">
            <div className="font-medium text-sm">Dietary Restrictions</div>
            <div className="md:col-span-2">
              {healthProfile.dietaryRestrictions && healthProfile.dietaryRestrictions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {healthProfile.dietaryRestrictions.map((restriction: string, index: number) => (
                    <Badge key={index} variant="outline">{restriction}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm">No dietary restrictions</span>
              )}
            </div>
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

export default UserHealthProfile;