// frontend/src/pages/adminUI/components/UserDetailsTabs.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Heart, 
  Pizza, 
  BookOpen
} from 'lucide-react';
import UserBasicInfo from './UserBasicInfo';
import UserHealthProfile from './UserHealthProfile';
import UserNutritionInfo from './UserNutritionInfo';
import UserSavedRecipes from './UserSavedRecipes';

interface UserDetailsTabsProps {
  user: any;
  formatDate: (dateString: string) => string;
}

const UserDetailsTabs: React.FC<UserDetailsTabsProps> = ({ user, formatDate }) => {
  if (!user) return null;

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Basic Info</span>
        </TabsTrigger>
        <TabsTrigger value="health" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Health Profile</span>
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="flex items-center gap-2">
          <Pizza className="h-4 w-4" />
          <span className="hidden sm:inline">Nutrition</span>
        </TabsTrigger>
        <TabsTrigger value="recipes" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Saved Recipes</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <UserBasicInfo user={user} formatDate={formatDate} />
      </TabsContent>
      
      <TabsContent value="health">
        <UserHealthProfile healthProfile={user.healthProfile} />
      </TabsContent>
      
      <TabsContent value="nutrition">
        <UserNutritionInfo nutrition={user.healthProfile?.calculatedNutrition} />
      </TabsContent>
      
      <TabsContent value="recipes">
        <UserSavedRecipes recipes={user.savedRecipes} formatDate={formatDate} />
      </TabsContent>
    </Tabs>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default UserDetailsTabs;