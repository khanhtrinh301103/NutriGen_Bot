// frontend/src/pages/adminUI/RecipeManagement.tsx
import React, { useState, useEffect } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Giả định dữ liệu công thức
const mockRecipes = [
  { id: '1', title: 'Healthy Vegetable Stir Fry', category: 'Vegetarian', status: 'published', featured: true, date: '2025-04-01' },
  { id: '2', title: 'Grilled Chicken Salad', category: 'Healthy', status: 'published', featured: false, date: '2025-04-02' },
  { id: '3', title: 'Protein Smoothie Bowl', category: 'Breakfast', status: 'draft', featured: false, date: '2025-04-05' },
  { id: '4', title: 'Salmon with Asparagus', category: 'Dinner', status: 'published', featured: true, date: '2025-04-08' },
  { id: '5', title: 'Quinoa Buddha Bowl', category: 'Lunch', status: 'published', featured: false, date: '2025-04-10' },
];

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch recipes
    const fetchRecipes = async () => {
      try {
        console.log("🍲 [Admin] Fetching recipes data");
        // In a real app, this would be an API call
        setTimeout(() => {
          setRecipes(mockRecipes);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("❌ [Admin] Error fetching recipes:", error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
    console.log("✏️ [Admin] Editing recipe:", recipe.title);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };

  const handleUpdateRecipe = () => {
    // In a real app, this would update the recipe in the database
    console.log("💾 [Admin] Updating recipe:", selectedRecipe);
    
    // Update recipe in local state
    setRecipes(recipes.map(recipe => 
      recipe.id === selectedRecipe.id ? selectedRecipe : recipe
    ));
    
    handleCloseModal();
  };

  const handleDeleteRecipe = (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      console.log("🗑️ [Admin] Deleting recipe ID:", recipeId);
      
      // Filter out the deleted recipe
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'published') return matchesSearch && recipe.status === 'published';
    if (filter === 'draft') return matchesSearch && recipe.status === 'draft';
    if (filter === 'featured') return matchesSearch && recipe.featured;
    
    return matchesSearch;
  });

  return (
    <AdminRoute>
      <AdminLayout title="Recipe Management">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row md:justify-between mb-6">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <label htmlFor="search" className="sr-only">Search recipes</label>
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
                    placeholder="Search recipes"
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
                  <option value="all">All Recipes</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
            </div>

            {/* Add New Recipe Button */}
            <div className="mb-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => {
                  setSelectedRecipe({
                    id: Date.now().toString(),
                    title: '',
                    category: 'Healthy',
                    status: 'draft',
                    featured: false,
                    date: new Date().toISOString().slice(0, 10)
                  });
                  setShowModal(true);
                }}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Recipe
              </button>
            </div>

            {/* Recipe Table */}
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
                                Recipe
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Featured
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecipes.map((recipe) => (
                              <tr key={recipe.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{recipe.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{recipe.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    recipe.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {recipe.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {recipe.featured ? (
                                    <span className="text-green-600">
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {recipe.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button 
                                    onClick={() => handleEditRecipe(recipe)}
                                    className="text-green-600 hover:text-green-900 mr-4"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteRecipe(recipe.id)}
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
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredRecipes.length}</span> of <span className="font-medium">{filteredRecipes.length}</span> results
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

            {/* Edit Recipe Modal */}
            {showModal && selectedRecipe && (
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
                            {selectedRecipe.title ? 'Edit Recipe' : 'Add New Recipe'}
                          </h3>
                          <div className="mt-2">
                            <div className="mb-4">
                              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                              <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={selectedRecipe.title}
                                onChange={(e) => setSelectedRecipe({...selectedRecipe, title: e.target.value})}
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                              <select 
                                id="category" 
                                name="category"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={selectedRecipe.category}
                                onChange={(e) => setSelectedRecipe({...selectedRecipe, category: e.target.value})}
                              >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Healthy">Healthy</option>
                                <option value="Vegetarian">Vegetarian</option>
                                <option value="Vegan">Vegan</option>
                                <option value="Snack">Snack</option>
                              </select>
                            </div>
                            <div className="mb-4">
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                              <select 
                                id="status" 
                                name="status"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                value={selectedRecipe.status}
                                onChange={(e) => setSelectedRecipe({...selectedRecipe, status: e.target.value})}
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                              </select>
                            </div>
                            <div className="flex items-center mb-4">
                              <input 
                                id="featured" 
                                name="featured" 
                                type="checkbox" 
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                checked={selectedRecipe.featured}
                                onChange={(e) => setSelectedRecipe({...selectedRecipe, featured: e.target.checked})}
                              />
                              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                                Featured Recipe
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button 
                        type="button" 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleUpdateRecipe}
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

export default RecipeManagement;