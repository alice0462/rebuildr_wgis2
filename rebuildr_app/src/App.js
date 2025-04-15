import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReviewPage from './reviewpage';
import React, { useState, useEffect } from 'react';

function HomePage() {
  const [storedRating, setStoredRating] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current user index

  useEffect(() => {
    fetch('/data/userData.json')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error loading user data:', err));
  }, []);
  const handleNextUser = () => {
    // Move to next index, wrap around if at end
    setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);
  };
  const user = users[currentIndex];

  let medalSrc = '';
  if (user) {
    const co2Value = parseInt(user.totalCo2Saved); // extracts number from "435 kg"
    if (co2Value < 300) {
      medalSrc = '/images/bronze-medal2.svg';
    } else if (co2Value < 700) {
      medalSrc = '/images/silver-medal2.svg';
    } else {
      medalSrc = '/images/gold-medal2.svg';
    }
  }
  useEffect(() => {
    const rating = localStorage.getItem("avgRating");
    setStoredRating(rating);
  }, []);
  
  return (
    <div className="app">
      <button onClick={handleNextUser}>Next User</button>
      <div id = "background"> 
        <div id="profile-pic">
          Profile pic
        </div>
        <div id="user-name">
        <p>{user ? user.name : 'Loading or user not found'}</p>
        </div>
        
        <div id="body">
          <div className="stats">
            <div id="rank">
            {user && (
              <img src={medalSrc} alt="user rank medal" id="medal" />
             )}
            </div>
            <div id="co2">
            <p>{user ? user.totalCo2Saved : 'Loading or user not found'}</p>
            </div>

              <div id="reviews">
                <Link to="/reviewpage" className="avg-rating-link">
                  {storedRating ? storedRating : 'No reviews yet'} / 5
                </Link>
              </div>

          </div>
          <div id = "treeBox">
            <img src="/tree.svg" alt="Tree" id='tree'/>
          </div>
          <div id = "curiosa">
            Curiosa
          </div>
        </div>
        
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reviewpage" element={<ReviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;