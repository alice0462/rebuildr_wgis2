import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReviewPage from './views/reviewpage';
//import Avtal from './views/avtal';
import React, { useState, useEffect } from 'react';
import IconPicker from './components/IconPicker.js';
import RankProgressBar from './components/RankProgressBar.js';

export function HomePage({userIndex,handleNextIndex,avgRating}) {
  
  const [users, setUsers] = useState([]);
  const [showRankProgress, setShowRankProgress] = useState(false);
  const [currentRank, setCurrentRank] = useState('bronze');
  const [currentCo2, setCurrentCo2] = useState(0);

useEffect(() => {
    fetch('/data/user_db.json')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error loading user data:', err));
  }, []);
  
  const user = users[userIndex];

  useEffect(() => {
    if (user) {
      const co2Value = parseInt(user.co2_saved);
      setCurrentCo2(co2Value);
      
      if (co2Value < 300) {
        setCurrentRank('bronze');
      } else if (co2Value < 700) {
        setCurrentRank('silver');
      } else {
        setCurrentRank('gold');
      }
    }
  }, [user]);

  let medalSrc = '';
  if (user) {
    const co2Value = parseInt(user.co2_saved); // extracts number from "435 kg"
    if (co2Value < 300) {
      medalSrc = '/images/bronze-medal2.svg';
    } else if (co2Value < 700) {
      medalSrc = '/images/silver-medal2.svg';
    } else {
      medalSrc = '/images/gold-medal2.svg';
    }
  }

  const handleMedalClick = () => {
    setShowRankProgress(true);
  };
  
  const handleCloseRankProgress = () => {
    setShowRankProgress(false);
  };
  
  return (
    <div className="app">
      <button onClick={handleNextIndex}>Next User {userIndex} </button>
      <div id = "background"> 
        <div id="profile-pic">
          Profile pic
        </div>

        <div id="user-name">
        <p>{user ? user.username : 'Loading or user not found'}</p>
        </div>
        
        <div id="body">
          
          <div className="stats">
          <div id="rank" onClick={handleMedalClick} style={{ cursor: 'pointer' }}>
            {user && (
              <img src={medalSrc} alt="user rank medal" id="medal" />
             )}
            </div>
            <div id="co2">
            <p>{user ? user.co2_saved : 'Loading or user not found'}</p>
            </div>

              <div id="reviews">
                <Link to="/reviewpage" className="avg-rating-link">
                  <p>{avgRating} / 5</p> 
                </Link>
              </div>
          </div>
          <div id = "treeBox">
          <IconPicker userId={user ? user.user_id : null}/>
          </div>
        </div>
        
      </div>
      {showRankProgress && (
        <>
          <div className="rank-overlay" onClick={handleCloseRankProgress}></div>
          <RankProgressBar 
            currentCo2={currentCo2}
            currentRank={currentRank}
            onClose={handleCloseRankProgress}
          />
        </>
      )}
    </div>
  );
}

function App() {
  const [userIndex, setIndex] = useState(0);
  const handleNextIndex = () => {
    // Move to next index, wrap around if at end
    setIndex((prevIndex) => (prevIndex + 1) % 10);
  };

  const [reviews, setReviews] = useState([]);
  //const { userId, setUserId } = useUser();

  useEffect(() => {
    fetch('/data/reviews_db.json')
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error loading user data:', err));
  }, []);

  const userReviews = reviews.filter((review) => review.reviewer_id === userIndex);
  const avgRating =
    userReviews.length > 0
      ? (
          userReviews.reduce((sum, review) => sum + review.rating, 0) /
          userReviews.length
        ).toFixed(1)
      : 0;
  


  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage 
        userIndex={userIndex} 
        handleNextIndex={handleNextIndex}
        avgRating={avgRating} 
        />} />
        <Route path="/reviewpage" element={<ReviewPage 
        userIndex={userIndex} 
        handleNextIndex={handleNextIndex}
        userReviews={userReviews}
        avgRating={avgRating} 
        />} />
      </Routes>
    </Router>
  );
}


export default App;