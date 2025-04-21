// frontend/src/pages/adminUI/components/UserSavedRecipes.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CalendarClock } from 'lucide-react';

interface UserSavedRecipesProps {
  recipes: any[];
  formatDate: (dateString: string) => string;
}

const UserSavedRecipes: React.FC<UserSavedRecipesProps> = ({ recipes, formatDate }) => {
  if (!recipes || recipes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Recipes</CardTitle>
          <CardDescription>User's saved recipes for quick access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-muted-foreground">No saved recipes found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Recipes</CardTitle>
        <CardDescription>User's saved recipes for quick access.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-md hover:bg-gray-50 transition-colors">
              <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {recipe.image ? (
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <span className="text-xl">🍽️</span>
                )}
              </div>
              
              <div className="flex-grow">
                <h4 className="font-medium line-clamp-1">{recipe.title}</h4>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {recipe.readyInMinutes} mins
                  </div>
                  <div className="flex items-center">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    {formatDate(recipe.savedAt)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    🍽️ {recipe.servings} servings
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    🥩 {recipe.protein.toFixed(1)}g
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-50">
                    🍚 {recipe.carbs.toFixed(1)}g
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-yellow-50">
                    🧈 {recipe.fat.toFixed(1)}g
                  </Badge>
                </div>
              </div>
              
              <div className="flex-shrink-0 mt-2 sm:mt-0">
                <Badge>ID: {recipe.id}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSavedRecipes;