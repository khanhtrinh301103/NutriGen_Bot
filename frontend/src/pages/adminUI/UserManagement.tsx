// frontend/src/pages/adminUI/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { getAllUsers } from '../../api/adminAPI/UserManagement';
import UserTable from './components/UserTable';

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
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredUsers = users.filter(user => {
    let pass = true;
    const hp = user.healthProfile || {};
    const userGoal = (hp.goal || '').toLowerCase();
    const userActivity = (hp.activityLevel || '').toLowerCase();
    const userGender = hp.gender || 'none';
    const userDietary = (hp.dietaryRestrictions || []).map((item: string) => item.toLowerCase());
    const userAllergies = (hp.allergies || []).map((item: string) => item.toLowerCase());

    if (goalFilter !== 'all' && userGoal !== goalFilter.toLowerCase()) pass = false;
    if (activityFilter !== 'all' && userActivity !== activityFilter.toLowerCase()) pass = false;
    if (genderFilter !== 'all' && userGender !== genderFilter) pass = false;
    if (dietaryFilter !== 'all' && !userDietary.includes(dietaryFilter.toLowerCase())) pass = false;
    if (allergyFilter !== 'all' && !userAllergies.includes(allergyFilter.toLowerCase())) pass = false;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const goal = (hp.goal || '').toLowerCase();
      const activity = (hp.activityLevel || '').toLowerCase();
      if (!name.includes(term) && !email.includes(term) && !goal.includes(term) && !activity.includes(term)) pass = false;
    }

    return pass;
  });

  const goalOptions = ['all', 'Weight Gain', 'Weight Loss', 'Weight Maintenance', 'Muscle Gain', 'Improve Health'];
  const activityOptions = ['all', 'Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
  const dietaryOptions = ['all', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo', 'Pescatarian', 'Mediterranean'];
  const genderOptions = ['all', 'Male', 'Female', 'Other'];
  const allergyOptions = ['all', 'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'];

  return (
    <AdminRoute>
      <AdminLayout title="User Management">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <input
                  type="search"
                  placeholder="Search by name, email, goal or activity level"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-auto flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs"
                />
                <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="text-xs px-3 py-2 border rounded-md">
                  {genderOptions.map(g => <option key={g} value={g}>{g === 'all' ? 'All Genders' : g}</option>)}
                </select>
                <select value={allergyFilter} onChange={(e) => setAllergyFilter(e.target.value)} className="text-xs px-3 py-2 border rounded-md">
                  {allergyOptions.map(a => <option key={a} value={a}>{a === 'all' ? 'All Allergies' : a}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)} className="text-xs px-3 py-2 border rounded-md">
                  {goalOptions.map(g => <option key={g} value={g}>{g === 'all' ? 'All Goals' : g}</option>)}
                </select>
                <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)} className="text-xs px-3 py-2 border rounded-md">
                  {activityOptions.map(a => <option key={a} value={a}>{a === 'all' ? 'All Activity Levels' : a}</option>)}
                </select>
                <select value={dietaryFilter} onChange={(e) => setDietaryFilter(e.target.value)} className="text-xs px-3 py-2 border rounded-md">
                  {dietaryOptions.map(d => <option key={d} value={d}>{d === 'all' ? 'All Dietary Options' : d}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <UserTable data={filteredUsers} />
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default UserManagement;
