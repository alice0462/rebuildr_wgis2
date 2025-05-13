
import "./StarRating.css";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Reviews = ({ avgRating }) => {

  const fullStarWidthRem = 5.5 * 0.8621 + 5.5 * 0.1379;
  const normalizedRating = Math.min(avgRating, 5);

  const fillWidthRem = (normalizedRating / 5) * fullStarWidthRem + 0.05;

      console.log("avgRating:", avgRating);
      console.log("fullStarWidthRem:", fullStarWidthRem);
      console.log("fillWidthRem:", fillWidthRem);

  return (
    <div id="reviews">
      <Link to="/reviewpage" className="avg-rating-link">
        <div className="rating-text">
          {avgRating} / 5
        </div>
        <div className="avg-star-rating">
          <div
            className="star-fill"
            style={{ width: `${fillWidthRem}rem` }}
          >
            <img src="/images/five-stars-colored.svg" alt="filled stars" />
          </div>
          <div className="star-empty">
            <img src="/images/five-stars-outline.svg" alt="empty stars" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Reviews;