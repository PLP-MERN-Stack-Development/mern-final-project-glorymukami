import React, { useState } from 'react';
import { useReviews } from '../../hooks/useReviews';
import ReviewForm from './ReviewForm';
import RatingDisplay from './RatingDisplay';

const ReviewSection = ({ productId, product }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { reviews, loading, error, addReview } = useReviews(productId);

  const handleReviewSubmit = async (reviewData) => {
    await addReview(reviewData);
    setShowReviewForm(false);
  };

  if (loading) return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Customer Reviews</h3>
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Write a Review
        </button>
      </div>

      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmit}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-6">
            <div className="flex items-center gap-4 mb-2">
              <img
                src={review.user.avatar || '/default-avatar.png'}
                alt={review.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-semibold">{review.user.name}</h4>
                <RatingDisplay rating={review.rating} />
              </div>
            </div>
            <h5 className="font-bold text-lg mb-2">{review.title}</h5>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;