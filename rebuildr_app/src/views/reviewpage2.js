import './reviewpage.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useUserIndex } from '../components/UserIndexContext';
function ReviewPage2() {
  const [reviews, setReviews] = useState([]);
  const { userIndex } = useUserIndex();
  useEffect(() => {
    fetch('/data/reviews_db.json')
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error loading user data:', err));
  }, []);

  const userReviews = reviews.filter((review) => review.reviewer_id === 1);
  const avgRating =
    userReviews.length > 0
      ? (
          userReviews.reduce((sum, review) => sum + review.rating, 0) /
          userReviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="review-container">
      <h1>Your Reviews</h1>

      <div className="avg-rating">
        <p>
          <strong>Average Rating:</strong> {avgRating} / 5
        </p>
      </div>

      <div className="all-reviews">
        {userReviews.length > 0 ? (
          userReviews.map((review) => (
            <div
              key={review.review_id}
              className="review-card border rounded-lg p-4 shadow"
            >
              <p>
                <strong>Rating:</strong> {review.rating}/5
              </p>
              <p>
                <strong>Comment:</strong> {review.comment}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(review.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No reviews found.</p>
        )}
      </div>

        <div className='return-container'>
          <Link to="/" className="returnbutton">
            <div>Return</div>
          </Link>
        </div>
      
      </div>

      
    );
  }
export default ReviewPage2;