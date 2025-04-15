import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReviewPage from './reviewpage';
import React, { useState, useEffect } from 'react';

function HomePage() {
  const [storedRating, setStoredRating] = useState(null);

  useEffect(() => {
    const rating = localStorage.getItem("avgRating");
    setStoredRating(rating);
  }, []);
  
  return (
    <div className="app">
      <div id = "background"> 
        <div id="profile-pic">
          Profile pic
        </div>
        <div id="user-name">
          User name
        </div>
        
        <div id="body">
          <div className="stats">
            <div id="rank">
              Rank
            </div>
            <div id="co2">
              Emission
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