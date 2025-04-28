// frontend/src/pages/adminUI/components/UserFilters.tsx
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCw, Check } from 'lucide-react';

interface UserFiltersProps {
  goalFilter: string;
  setGoalFilter: (value: string) => void;
  activityFilter: string;
  setActivityFilter: (value: string) => void;
  dietaryFilter: string;
  setDietaryFilter: (value: string) => void;
  genderFilter: string;
  setGenderFilter: (value: string) => void;
  allergyFilter: string;
  setAllergyFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  resetFilters: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  goalFilter,
  setGoalFilter,
  activityFilter,
  setActivityFilter,
  dietaryFilter,
  setDietaryFilter,
  genderFilter,
  setGenderFilter,
  allergyFilter,
  setAllergyFilter,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  resetFilters
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const goalOptions = ['all', 'Weight Gain', 'Weight Loss', 'Weight Maintenance', 'Muscle Gain', 'Improve Health'];
  const activityOptions = ['all', 'Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
  const dietaryOptions = ['all', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo', 'Pescatarian', 'Mediterranean'];
  const genderOptions = ['all', 'Male', 'Female'];
  const allergyOptions = ['all', 'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'];
  const statusOptions = ['all', 'active', 'suspended'];

  const handleReset = () => {
    console.log("🔄 [Admin] Starting filter reset process");
    setIsResetting(true);
    
    // Simulate loading time for effect
    setTimeout(() => {
      resetFilters();
      setIsResetting(false);
      setResetSuccess(true);
      console.log("✅ [Admin] Filters have been reset successfully");
      
      // Clear success state after 1.5 seconds
      setTimeout(() => {
        setResetSuccess(false);
      }, 1500);
    }, 600);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
      <div className="flex flex-col gap-4">
        {/* Search Bar with Icon */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by name, email, goal or activity level"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        {/* Filter Section */}
        <div>
          <div className="flex items-center mb-3 space-x-2">
            <Filter className="h-4 w-4 text-gray-700" />
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto flex items-center text-xs h-8"
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Resetting...
                </>
              ) : resetSuccess ? (
                <>
                  <Check className="mr-1 h-3 w-3 text-green-500" />
                  Reset Complete
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Reset
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            {/* Status Filter */}
            <div>
              <Label htmlFor="status-filter" className="text-xs mb-1 text-gray-600">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Gender Filter */}
            <div>
              <Label htmlFor="gender-filter" className="text-xs mb-1 text-gray-600">Gender</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger id="gender-filter" className="w-full h-9 text-xs">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {genderOptions.map(g => (
                      <SelectItem key={g} value={g} className="text-xs">
                        {g === 'all' ? 'All Genders' : g}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Goal Filter */}
            <div>
              <Label htmlFor="goal-filter" className="text-xs mb-1 text-gray-600">Goal</Label>
              <Select value={goalFilter} onValueChange={setGoalFilter}>
                <SelectTrigger id="goal-filter" className="w-full h-9 text-xs">
                  <SelectValue placeholder="All Goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {goalOptions.map(g => (
                      <SelectItem key={g} value={g} className="text-xs">
                        {g === 'all' ? 'All Goals' : g}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Filter */}
            <div>
              <Label htmlFor="activity-filter" className="text-xs mb-1 text-gray-600">Activity Level</Label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger id="activity-filter" className="w-full h-9 text-xs">
                  <SelectValue placeholder="All Activity Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {activityOptions.map(a => (
                      <SelectItem key={a} value={a} className="text-xs">
                        {a === 'all' ? 'All Activity Levels' : a}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Dietary Filter */}
            <div>
              <Label htmlFor="dietary-filter" className="text-xs mb-1 text-gray-600">Dietary Restriction</Label>
              <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                <SelectTrigger id="dietary-filter" className="w-full h-9 text-xs">
                  <SelectValue placeholder="All Dietary Options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {dietaryOptions.map(d => (
                      <SelectItem key={d} value={d} className="text-xs">
                        {d === 'all' ? 'All Dietary Options' : d}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Allergy Filter */}
            <div>
              <Label htmlFor="allergy-filter" className="text-xs mb-1 text-gray-600">Allergy</Label>
              <Select value={allergyFilter} onValueChange={setAllergyFilter}>
                <SelectTrigger id="allergy-filter" className="w-full h-9 text-xs">
                  <SelectValue placeholder="All Allergies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {allergyOptions.map(a => (
                      <SelectItem key={a} value={a} className="text-xs">
                        {a === 'all' ? 'All Allergies' : a}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;