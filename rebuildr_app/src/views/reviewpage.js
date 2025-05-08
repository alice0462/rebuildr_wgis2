import './reviewpage.css';
import { Link } from 'react-router-dom';

function ReviewPage() {
  const reviews = [
    {name: "Emma Svensson", rating: 5, comment: "I really liked the screws I bought from you:)"},
    {name: "Åke Erling", rating: 4, comment: "Good affair"},
    {name: "Agnes Berg", rating:5, comment: "I really recommend this seller and I appreciate how easy it is to save the planet by using this amazing app!"},
    {name: "Henrik Hult", rating: 1, comment: "Not okay. He selled me wood containing asbestos"},
  ];  
  
  const avgRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);

    localStorage.setItem("avgRating", avgRating);
  
  return (
      <div className='background'>
        <div className="review-container">
        <h1>Your Reviews</h1>

        <div className='avg-rating'>
          <p><strong>Average Rating:</strong> {avgRating} / 5</p>
        </div>
      
        <div className='all-reviews'>
          {reviews.map((review, index) => (
          <div key={index} className="review-card">
            <h3>{review.name}</h3>
            <p><strong>Rating:</strong> {review.rating}/5</p>
            <p><strong>Comment:</strong> {review.comment}</p>
          </div>
        ))}
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

