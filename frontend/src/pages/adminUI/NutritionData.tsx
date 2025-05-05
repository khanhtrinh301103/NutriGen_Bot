// frontend/src/pages/adminUI/NutritionData.tsx
import React, { useState, useEffect } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Giả định dữ liệu dinh dưỡng
const mockNutritionData = [
  { id: '1', foodName: 'Apple', category: 'Fruit', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, status: 'active' },
  { id: '2', foodName: 'Chicken Breast', category: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, status: 'active' },
  { id: '3', foodName: 'Spinach', category: 'Vegetable', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, status: 'active' },
  { id: '4', foodName: 'Brown Rice', category: 'Grain', calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9, fiber: 1.8, status: 'active' },
  { id: '5', foodName: 'Salmon', category: 'Protein', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, status: 'active' },
];

const NutritionData = () => {
  const [nutritionItems, setNutritionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch nutrition data
    const fetchNutritionData = async () => {
      try {
        console.log("🥗 [Admin] Fetching nutrition data");
        // In a real app, this would be an API call
        setTimeout(() => {
          setNutritionItems(mockNutritionData);
          setLoading(false);
        }, 1000);
    } catch (error) {
        console.error("❌ [Admin] Error fetching nutrition data:", error);
        setLoading(false);
      }
    };

    fetchNutritionData();
  }, []);

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    console.log("✏️ [Admin] Editing nutrition item:", item.foodName);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleUpdateItem = () => {
    // In a real app, this would update the nutrition item in the database
    console.log("💾 [Admin] Updating nutrition item:", selectedItem);
    
    // Update item in local state
    setNutritionItems(nutritionItems.map(item => 
      item.id === selectedItem.id ? selectedItem : item
    ));
    
    handleCloseModal();
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this nutrition item?')) {
      console.log("🗑️ [Admin] Deleting nutrition item ID:", itemId);
      
      // Filter out the deleted item
      setNutritionItems(nutritionItems.filter(item => item.id !== itemId));
    }
  };

  const filteredItems = nutritionItems.filter(item => {
    const matchesSearch = item.foodName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'protein') return matchesSearch && item.category === 'Protein';
    if (filter === 'fruit') return matchesSearch && item.category === 'Fruit';
    if (filter === 'vegetable') return matchesSearch && item.category === 'Vegetable';
    if (filter === 'grain') return matchesSearch && item.category === 'Grain';
    
    return matchesSearch;
  });

  return (
    <AdminRoute>
      <AdminLayout title="Nutrition Database">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row md:justify-between mb-6">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <label htmlFor="search" className="sr-only">Search food items</label>
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
                    placeholder="Search food items"
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
                  <option value="all">All Categories</option>
                  <option value="protein">Protein</option>
                  <option value="fruit">Fruits</option>
                  <option value="vegetable">Vegetables</option>
                  <option value="grain">Grains</option>
                </select>
              </div>
            </div>

            {/* Add New Item Button */}
            <div className="mb-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => {
                  setSelectedItem({
                    id: Date.now().toString(),
                    foodName: '',
                    category: 'Vegetable',
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0,
                    status: 'active'
                  });
                  setShowModal(true);
                }}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Food Item
              </button>
            </div>

            {/* Nutrition Table */}
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
                                Food Item
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Calories
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Protein (g)
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Carbs (g)
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fat (g)
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{item.foodName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{item.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{item.calories}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{item.protein}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{item.carbs}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{item.fat}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button 
                                    onClick={() => handleEditItem(item)}
                                    className="text-green-600 hover:text-green-900 mr-4"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-red-600 hover:text-red-900"
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
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredItems.length}</span> of <span className="font-medium">{filteredItems.length}</span> results
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

            {/* Edit Nutrition Item Modal */}
            {showModal && selectedItem && (
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
                            {selectedItem.foodName ? 'Edit Food Item' : 'Add New Food Item'}
                          </h3>
                          <div className="mt-2">
                            <div className="mb-4">
                              <label htmlFor="foodName" className="block text-sm font-medium text-gray-700">Food Name</label>
                              <input 
                                type="text" 
                                name="foodName" 
                                id="foodName" 
                                className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={selectedItem.foodName}
                                onChange={(e) => setSelectedItem({...selectedItem, foodName: e.target.value})}
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                              <select 
                                id="category" 
                                name="category"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={selectedItem.category}
                                onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}
                              >
                                <option value="Protein">Protein</option>
                                <option value="Fruit">Fruit</option>
                                <option value="Vegetable">Vegetable</option>
                                <option value="Grain">Grain</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Fat">Fat</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="mb-4">
                                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
                                <input 
                                  type="number" 
                                  name="calories" 
                                  id="calories" 
                                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  value={selectedItem.calories}
                                  onChange={(e) => setSelectedItem({...selectedItem, calories: parseFloat(e.target.value)})}
                                />
                              </div>
                              <div className="mb-4">
                                <label htmlFor="protein" className="block text-sm font-medium text-gray-700">Protein (g)</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  name="protein" 
                                  id="protein" 
                                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  value={selectedItem.protein}
                                  onChange={(e) => setSelectedItem({...selectedItem, protein: parseFloat(e.target.value)})}
                                />
                              </div>
                              <div className="mb-4">
                                <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  name="carbs" 
                                  id="carbs" 
                                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  value={selectedItem.carbs}
                                  onChange={(e) => setSelectedItem({...selectedItem, carbs: parseFloat(e.target.value)})}
                                />
                              </div>
                              <div className="mb-4">
                                <label htmlFor="fat" className="block text-sm font-medium text-gray-700">Fat (g)</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  name="fat" 
                                  id="fat" 
                                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  value={selectedItem.fat}
                                  onChange={(e) => setSelectedItem({...selectedItem, fat: parseFloat(e.target.value)})}
                                />
                              </div>
                              <div className="mb-4">
                                <label htmlFor="fiber" className="block text-sm font-medium text-gray-700">Fiber (g)</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  name="fiber" 
                                  id="fiber" 
                                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                  value={selectedItem.fiber}
                                  onChange={(e) => setSelectedItem({...selectedItem, fiber: parseFloat(e.target.value)})}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button 
                        type="button" 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleUpdateItem}
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


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default NutritionData;