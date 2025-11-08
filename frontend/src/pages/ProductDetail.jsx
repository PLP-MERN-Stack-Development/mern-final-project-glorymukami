import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add products to cart');
      window.location.href = '/login';
      return;
    }

    try {
      await addToCart(product);
      alert(`✅ "${product.name}" added to cart successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await productAPI.addReview(id, review);
      await fetchProduct(); // Refresh product data
      setReview({ rating: 5, comment: '' });
      alert('Review submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
            <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Product Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-4">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0].url} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-6xl">📦</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {product.averageRating > 0 && (
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-500 text-xl">
                      {star <= product.averageRating ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {product.averageRating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            <p className="text-3xl font-bold text-blue-600 mb-6">${product.price}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <span className="text-gray-700 font-medium mr-2">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )}
              </div>

              {product.brand && (
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium mr-2">Brand:</span>
                  <span className="text-gray-900">{product.brand}</span>
                </div>
              )}

              {product.category && (
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium mr-2">Category:</span>
                  <span className="text-gray-900">{product.category}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-1">✓</span>
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-1">✓</span>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'description', name: 'Description' },
              { id: 'specifications', name: 'Specifications' },
              { id: 'reviews', name: `Reviews (${product.reviewCount || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && product.specifications && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>
              
              {/* Add Review Form */}
              {user && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold mb-4">Write a Review</h4>
                  <form onSubmit={submitReview}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReview({ ...review, rating: star })}
                            className="text-2xl focus:outline-none"
                          >
                            {star <= review.rating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={review.comment}
                        onChange={(e) => setReview({ ...review, comment: e.target.value })}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Share your experience with this product..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 mr-3">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex text-yellow-500">
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;