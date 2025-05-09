import './reviewpage.css';
import { Link } from 'react-router-dom';

export function ReviewPage({userIndex,avgRating,userReviews}) {

  return (
      <div className='app'>
        
        <img src="/SvgIcons/figma_pic1.png" alt="figma1" className="figma-image" />
        <img src="/SvgIcons/Header (1).png" alt="header" className="background-image" />

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
      </div>

      
    );
  }
export default ReviewPage;

