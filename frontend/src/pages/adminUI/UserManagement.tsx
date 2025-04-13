// frontend/src/pages/adminUI/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Giả định dữ liệu người dùng
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', role: 'user', lastLogin: '2025-04-10' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', role: 'user', lastLogin: '2025-04-12' },
  { id: '3', name: 'Admin User', email: 'admin@gmail.com', status: 'active', role: 'admin', lastLogin: '2025-04-13' },
  { id: '4', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', role: 'user', lastLogin: '2025-03-20' },
  { id: '5', name: 'Alice Brown', email: 'alice@example.com', status: 'active', role: 'user', lastLogin: '2025-04-11' },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch users
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        console.log("👥 [Admin] Fetching users data");
        setTimeout(() => {
          setUsers(mockUsers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("❌ [Admin] Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    console.log("✏️ [Admin] Editing user:", user.email);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = () => {
    // In a real app, this would update the user in the database
    console.log("💾 [Admin] Updating user:", selectedUser);
    
    // Update user in local state
    setUsers(users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));
    
    handleCloseModal();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log("🗑️ [Admin] Deleting user ID:", userId);
      
      // Filter out the deleted user
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && user.status === 'active';
    if (filter === 'inactive') return matchesSearch && user.status === 'inactive';
    if (filter === 'admin') return matchesSearch && user.role === 'admin';
    
    return matchesSearch;
  });

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
                            {filteredUsers.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">{user.name.charAt(0)}</span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                      <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.lastLogin}
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
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
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{filteredUsers.length}</span> results
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
                                value={selectedUser.name}
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
                                value={selectedUser.email}
                                readOnly={selectedUser.email === 'admin@gmail.com'}
                                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                              />
                              {selectedUser.email === 'admin@gmail.com' && (
                                <p className="mt-1 text-xs text-gray-500">Admin email cannot be changed</p>
                              )}
                            </div>
                            <div className="mb-4">
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                              <select 
                                id="status" 
                                name="status"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={selectedUser.status}
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
                                value={selectedUser.role}
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