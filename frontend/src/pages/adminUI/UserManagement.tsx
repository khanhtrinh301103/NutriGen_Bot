// frontend/src/pages/adminUI/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { 
  getAllUsers, 
  updateUser, 
  deleteUserAccount, 
  changeUserStatus,
  searchUsers,
  filterUsersByStatus,
  filterUsersByRole
} from '../../api/adminAPI/UserManagement';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch users when component mounts
    fetchUsers();
  }, []);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("👥 [Admin] Fetching users data from Firestore");
      
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("❌ [Admin] Error fetching users:", error);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user filtering when filter changes
  useEffect(() => {
    if (filter === 'all' && !searchTerm) {
      fetchUsers();
      return;
    }
    
    handleFilterChange(filter);
  }, [filter]);

  // Handle search when search term changes
  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else if (!searchTerm && filter === 'all') {
      fetchUsers();
    } else {
      handleFilterChange(filter);
    }
  }, [searchTerm]);

  // Search users by name or email
  const handleSearch = async () => {
    if (!searchTerm) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const filteredUsers = await searchUsers(searchTerm);
      
      // Apply additional filter if needed
      if (filter !== 'all') {
        const finalUsers = filteredUsers.filter(user => {
          if (filter === 'active') return user.status === 'active';
          if (filter === 'inactive') return user.status === 'inactive';
          if (filter === 'admin') return user.role === 'admin';
          return true;
        });
        setUsers(finalUsers);
      } else {
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("❌ [Admin] Error searching users:", error);
      setError("Failed to search users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users by status or role
  const handleFilterChange = async (filterValue) => {
    try {
      setLoading(true);
      setError(null);
      
      let filteredUsers = [];
      
      if (filterValue === 'active' || filterValue === 'inactive') {
        filteredUsers = await filterUsersByStatus(filterValue);
      } else if (filterValue === 'admin') {
        filteredUsers = await filterUsersByRole('admin');
      } else {
        // 'all' filter
        filteredUsers = await getAllUsers();
      }
      
      // Apply search term if present
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error("❌ [Admin] Error filtering users:", error);
      setError("Failed to filter users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    console.log("✏️ [Admin] Editing user:", user.email);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    try {
      setError(null);
      
      // Update user in Firebase
      console.log("💾 [Admin] Updating user:", selectedUser);
      await updateUser(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        status: selectedUser.status,
        role: selectedUser.role
      });
      
      // Update user in local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      
      handleCloseModal();
    } catch (error) {
      console.error("❌ [Admin] Error updating user:", error);
      setError("Failed to update user. " + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError(null);
        console.log("🗑️ [Admin] Deleting user ID:", userId);
        
        // Delete user in Firebase
        await deleteUserAccount(userId);
        
        // Remove user from local state
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error("❌ [Admin] Error deleting user:", error);
        setError("Failed to delete user. " + error.message);
      }
    }
  };

  // Change user status (active/inactive)
  const handleStatusChange = async (userId, newStatus) => {
    try {
      setError(null);
      console.log(`🔄 [Admin] Changing status for user ${userId} to ${newStatus}`);
      
      // Update status in Firebase
      await changeUserStatus(userId, newStatus);
      
      // Update user in local state
      setUsers(users.map(user => 
        user.id === userId ? {...user, status: newStatus} : user
      ));
    } catch (error) {
      console.error("❌ [Admin] Error changing user status:", error);
      setError("Failed to change user status. " + error.message);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="User Management">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row md:justify-between mb-6">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <label htmlFor="search" className="sr-only">Search users</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Search users"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* User Table */}
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Login
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {users.length > 0 ? (
                              users.map((user) => (
                                <tr key={user.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-gray-500">{user.name ? user.name.charAt(0) : '?'}</span>
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <Link href={`/adminUI/UserDetails?userId=${user.id}`} className="text-sm font-medium text-gray-900 hover:text-green-600">
                                          {user.name || 'Unknown User'}
                                        </Link>
                                        <div className="text-sm text-gray-500">{user.email || 'No Email'}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {user.status || 'unknown'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.role || 'user'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.lastLogin || 'Never'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                      onClick={() => handleEditUser(user)}
                                      className="text-green-600 hover:text-green-900 mr-4"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-600 hover:text-red-900"
                                      disabled={user.email === 'admin@gmail.com'}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                  {searchTerm || filter !== 'all' 
                                    ? 'No users match your search or filter criteria' 
                                    : 'No users found in the database'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {users.length > 0 && (
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Previous
                      </a>
                      <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Next
                      </a>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of <span className="font-medium">{users.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span className="sr-only">Previous</span>
                            &larr;
                          </a>
                          <a href="#" aria-current="page" className="z-10 bg-green-50 border-green-500 text-green-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                            1
                          </a>
                          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span className="sr-only">Next</span>
                            &rarr;
                          </a>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Edit User Modal */}
            {showModal && selectedUser && (
              <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>

                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            Edit User
                          </h3>
                          <div className="mt-2">
                            <div className="mb-4">
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                              <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={selectedUser.name || ''}
                                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                              <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={selectedUser.email || ''}
                                readOnly={selectedUser.email === 'admin@gmail.com'}
                                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                              />
                              {selectedUser.email === 'admin@gmail.com' && (
                                <p className="mt-1 text-xs text-gray-500">Admin email cannot be changed</p>
                              )}
                              {selectedUser.email !== 'admin@gmail.com' && (
                                <p className="mt-1 text-xs text-yellow-500">
                                  Note: Email changes require Firebase Admin SDK and may not be fully implemented in this version
                                </p>
                              )}
                            </div>
                            <div className="mb-4">
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                              <select 
                                id="status" 
                                name="status"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={selectedUser.status || 'active'}
                                onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                                disabled={selectedUser.email === 'admin@gmail.com'}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                            <div className="mb-4">
                              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                              <select 
                                id="role" 
                                name="role"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={selectedUser.role || 'user'}
                                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                                disabled={selectedUser.email === 'admin@gmail.com'}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button 
                        type="button" 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleUpdateUser}
                      >
                        Save
                      </button>
                      <button 
                        type="button" 
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default UserManagement;