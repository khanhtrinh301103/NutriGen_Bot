// frontend/src/pages/adminUI/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { getAllUsers } from '../../api/adminAPI/UserManagement';

// Define filter options (all texts in English)
const goalOptions = ['all', 'Weight Gain', 'Weight Loss', 'Weight Maintenance', 'Muscle Gain', 'Improve Health'];
const activityOptions = ['all', 'Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
const dietaryOptions = ['all', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo', 'Pescatarian', 'Mediterranean'];
const genderOptions = ['all', 'Male', 'Female', 'Other'];
const allergyOptions = ['all', 'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'];

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [allergyFilter, setAllergyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("👥 [Admin] Fetching all users from Firestore");
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      console.log(`✅ [Admin] Fetched ${fetchedUsers.length} users`);
    } catch (err: any) {
      console.error("❌ [Admin] Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering (bao gồm search, lọc dropdown)
  const filteredUsers = users.filter(user => {
    let pass = true;
    
    // Apply dropdown filters
    const userGoal = (user.healthProfile?.goal || "none").toLowerCase();
    const userActivity = (user.healthProfile?.activityLevel || "none").toLowerCase();
    const userGender = user.healthProfile?.gender || "none";
    const userDietaryArr = user.healthProfile?.dietaryRestrictions || [];
    const userAllergiesArr = user.healthProfile?.allergies || [];
    
    if (goalFilter !== 'all' && userGoal !== goalFilter.toLowerCase()) pass = false;
    if (activityFilter !== 'all' && userActivity !== activityFilter.toLowerCase()) pass = false;
    if (genderFilter !== 'all' && userGender !== genderFilter) pass = false;
    
    if (dietaryFilter !== 'all') {
      const userDietary = userDietaryArr.map((item: string) => item.toLowerCase());
      if (!userDietary.includes(dietaryFilter.toLowerCase())) pass = false;
    }
    
    if (allergyFilter !== 'all') {
      const userAllergies = userAllergiesArr.map((item: string) => item.toLowerCase());
      if (!userAllergies.includes(allergyFilter.toLowerCase())) pass = false;
    }
    
    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      
      // Get fields to search and convert to lowercase for case-insensitive search
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const goal = (user.healthProfile?.goal || "").toLowerCase();
      const activity = (user.healthProfile?.activityLevel || "").toLowerCase();
      
      // Check if any field matches the search term
      const matchFound = 
        name.includes(lowerSearchTerm) || 
        email.includes(lowerSearchTerm) || 
        goal.includes(lowerSearchTerm) || 
        activity.includes(lowerSearchTerm);
      
      if (!matchFound) {
        pass = false;
      }
    }
    
    return pass;
  });

  // Format array data for display
  const formatArrayData = (arr: string[] | undefined) => {
    if (!arr || arr.length === 0) return "none";
    return arr.join(", ");
  };

  useEffect(() => {
    console.log("🔍 [Admin] Filter changed:", { 
      goalFilter, 
      activityFilter, 
      dietaryFilter, 
      genderFilter, 
      allergyFilter, 
      searchTerm 
    });
  }, [goalFilter, activityFilter, dietaryFilter, genderFilter, allergyFilter, searchTerm]);

  return (
    <AdminRoute>
      <AdminLayout title="User Management">
        <div className="px-4 py-6 sm:px-0">
          {/* Container Card */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            {/* Search & Filter Section */}
            <div className="mb-6">
              {/* Search Bar and Filters in one horizontal row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Search Bar */}
                <div className="w-full md:w-auto flex-grow pr-2">
                  <input
                    type="search"
                    placeholder="Search by name, email, goal or activity level"
                    value={searchTerm}
                    onChange={(e) => {
                      console.log(`🔄 [Admin] Search term changed to: ${e.target.value}`);
                      setSearchTerm(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-xs"
                  />
                </div>
                
                {/* Filters */}
                <select
                  value={genderFilter}
                  onChange={(e) => {
                    console.log(`🔄 [Admin] Gender filter changed to: ${e.target.value}`);
                    setGenderFilter(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-xs"
                >
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option === 'all' ? 'All Genders' : option}</option>
                  ))}
                </select>
                
                <select
                  value={allergyFilter}
                  onChange={(e) => {
                    console.log(`🔄 [Admin] Allergy filter changed to: ${e.target.value}`);
                    setAllergyFilter(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-xs"
                >
                  {allergyOptions.map(option => (
                    <option key={option} value={option}>{option === 'all' ? 'All Allergies' : option}</option>
                  ))}
                </select>
              </div>
              
              {/* Second row of filters */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <select
                  value={goalFilter}
                  onChange={(e) => {
                    console.log(`🔄 [Admin] Goal filter changed to: ${e.target.value}`);
                    setGoalFilter(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-xs"
                >
                  {goalOptions.map(option => (
                    <option key={option} value={option}>{option === 'all' ? 'All Goals' : option}</option>
                  ))}
                </select>
                
                <select
                  value={activityFilter}
                  onChange={(e) => {
                    console.log(`🔄 [Admin] Activity filter changed to: ${e.target.value}`);
                    setActivityFilter(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-xs"
                >
                  {activityOptions.map(option => (
                    <option key={option} value={option}>{option === 'all' ? 'All Activity Levels' : option}</option>
                  ))}
                </select>
                
                <select
                  value={dietaryFilter}
                  onChange={(e) => {
                    console.log(`🔄 [Admin] Dietary filter changed to: ${e.target.value}`);
                    setDietaryFilter(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-xs"
                >
                  {dietaryOptions.map(option => (
                    <option key={option} value={option}>{option === 'all' ? 'All Dietary Options' : option}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-xs">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto border-2 border-solid">
                <table className="min-w-full table-fixed text-xs">
                  <thead className="bg-green-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/8">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/8">Email</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/12">Gender</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/12">Age</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/12">Height</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/12">Weight</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/8">Goal</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/8">Activity</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/8">Dietary</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/8">Allergies</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/12">BMR</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/12">TDEE</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/12">Role</th>
                      <th className="px-3 py-2 text-left font-semibold text-white uppercase w-1/8">Registered</th>
                      <th className="px-3 py-2 text-center font-semibold text-white uppercase w-1/12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => {
                        const fullName = user.name || "none";
                        const email = user.email || "none";
                        const gender = user.healthProfile?.gender || "none";
                        const age = user.healthProfile?.age || "none";
                        const height = user.healthProfile?.height || "none";
                        const weight = user.healthProfile?.weight || "none";
                        const goal = user.healthProfile?.goal || "none";
                        const activityLevel = user.healthProfile?.activityLevel || "none";
                        const dietary = formatArrayData(user.healthProfile?.dietaryRestrictions);
                        const allergies = formatArrayData(user.healthProfile?.allergies);
                        const bmr = user.healthProfile?.calculatedNutrition?.bmr || "none";
                        const tdee = user.healthProfile?.calculatedNutrition?.tdee || "none";
                        const role = user.role || "none";
                        const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "none";

                        return (
                          <tr key={user.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{fullName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{email}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{gender}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{age}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{height}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{weight}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{goal}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{activityLevel}</td>
                            <td className="px-3 py-2 text-gray-900" title={dietary}>
                              <div className="max-w-xs truncate">{dietary}</div>
                            </td>
                            <td className="px-3 py-2 text-gray-900" title={allergies}>
                              <div className="max-w-xs truncate">{allergies}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{bmr}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{tdee}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{role}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-900">{registrationDate}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <Link
                                href={`/adminUI/UserDetails?userId=${user.id}`}
                                className="inline-block bg-green-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={15} className="px-3 py-2 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default UserManagement;