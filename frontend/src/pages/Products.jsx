import React, { useState, useEffect } from 'react';
import { productAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductSearch from '../components/product/ProductSearch';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchTerm || undefined
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await productAPI.getAll(params);
      setProducts(response.data.data);
    } catch (error) {
      setError('Failed to load products from server');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price':
            return a.price - b.price;
          case '-price':
            return b.price - a.price;
          case '-createdAt':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'createdAt':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case '-averageRating':
            return (b.averageRating || 0) - (a.averageRating || 0);
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const addToCart = async (productId, productName) => {
    if (!user) {
      alert('Please login to add products to cart');
      window.location.href = '/login';
      return;
    }

    setAddingToCart(productId);
    try {
      await cartAPI.addItem({ productId, quantity: 1 });
      alert(`✅ "${productName}" added to cart successfully!`);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please login to add products to cart');
        window.location.href = '/login';
      } else {
        alert(error.response?.data?.message || 'Failed to add product to cart');
      }
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
            <p className="text-gray-600">
              {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>
          {user && (
            <a href="/cart" className="btn-secondary flex items-center space-x-2">
              <span>🛒</span>
              <span>View Cart</span>
            </a>
          )}
        </div>

        {/* Search and Filters */}
        <ProductSearch onSearch={handleSearch} onFilter={handleFilter} />

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
            <p className="text-sm mt-1">Showing sample products instead</p>
          </div>
        )}

        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Products Found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilters({});
              }}
              className="btn-primary"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
              <div key={product._id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url || product.featuredImage} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  {product.inventory?.stock > 0 ? (
                    <span className="text-sm text-green-600">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>

                {product.averageRating > 0 && (
                  <div className="flex items-center mb-3">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">
                      {product.averageRating} ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                <button 
                  onClick={() => addToCart(product._id, product.name)}
                  disabled={addingToCart === product._id || product.inventory?.stock === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart === product._id ? 'Adding...' : 
                   product.inventory?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;