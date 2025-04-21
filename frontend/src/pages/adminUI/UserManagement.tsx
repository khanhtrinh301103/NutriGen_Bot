import React, { useState, useEffect } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { getAllUsers } from '../../api/adminAPI/UserManagement';
import UserFilters from './components/UserFilters';
import UserDataTable from './components/UserDataTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportUsersToExcel } from '../../utils/exportToExcel';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [allergyFilter, setAllergyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("🔍 [Admin] Fetching users for UserManagement page");
      setLoading(true);
      setError(null);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      console.log(`✅ [Admin] Successfully loaded ${fetchedUsers.length} users`);
    } catch (err: any) {
      console.error("❌ [Admin] Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    console.log("🔄 [Admin] Resetting all user filters");
    setGoalFilter('all');
    setActivityFilter('all');
    setDietaryFilter('all');
    setGenderFilter('all');
    setAllergyFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  const filteredUsers = users.filter(user => {
    let pass = true;
    const hp = user.healthProfile || {};
    const userGoal = (hp.goal || '').toLowerCase();
    const userActivity = (hp.activityLevel || '').toLowerCase();
    const userGender = (hp.gender || 'none').toLowerCase();
    const userDietary = (hp.dietaryRestrictions || []).map((item: string) => item.toLowerCase());
    const userAllergies = (hp.allergies || []).map((item: string) => item.toLowerCase());
    const userStatus = (user.status || 'active').toLowerCase();

    if (goalFilter !== 'all' && userGoal !== goalFilter.toLowerCase()) pass = false;
    if (activityFilter !== 'all' && userActivity !== activityFilter.toLowerCase()) pass = false;
    if (genderFilter !== 'all' && userGender !== genderFilter.toLowerCase()) pass = false;
    if (dietaryFilter !== 'all' && !userDietary.includes(dietaryFilter.toLowerCase())) pass = false;
    if (allergyFilter !== 'all' && !userAllergies.includes(allergyFilter.toLowerCase())) pass = false;
    if (statusFilter !== 'all' && userStatus !== statusFilter.toLowerCase()) pass = false;

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

  return (
    <AdminRoute>
      <AdminLayout title="User Management">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <UsersRound className="mr-2 h-5 w-5" />
                    View and manage registered users and their health profiles
                  </CardTitle>
                </div>
                <Button onClick={() => exportUsersToExcel(filteredUsers)} className="text-sm">
                  Export to Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserFilters
                goalFilter={goalFilter}
                setGoalFilter={setGoalFilter}
                activityFilter={activityFilter}
                setActivityFilter={setActivityFilter}
                dietaryFilter={dietaryFilter}
                setDietaryFilter={setDietaryFilter}
                genderFilter={genderFilter}
                setGenderFilter={setGenderFilter}
                allergyFilter={allergyFilter}
                setAllergyFilter={setAllergyFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                resetFilters={resetFilters}
              />

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Loading users...</p>
                  </div>
                </div>
              ) : (
                <UserDataTable data={filteredUsers} refreshData={fetchUsers} />
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default UserManagement;
