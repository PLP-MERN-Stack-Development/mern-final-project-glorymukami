import { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';

export const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewAPI.getProductReviews(productId);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData) => {
    try {
      await reviewAPI.createReview(productId, reviewData);
      await fetchReviews(); // Refresh the list
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  return { reviews, loading, addReview, fetchReviews };
};