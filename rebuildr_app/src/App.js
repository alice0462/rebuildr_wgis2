import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReviewPage from './views/reviewpage';
import React, { useState, useEffect } from 'react';
import IconPicker from './components/IconPicker.js';
import RankProgressBar from './components/RankProgressBar.js';

function HomePage() {
  const [storedRating, setStoredRating] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current user index
  const [emissions, setEmissions] = useState(0);
  const [curiosa, setCuriosa] = useState('');
  const [showRankProgress, setShowRankProgress] = useState(false);
  const [currentRank, setCurrentRank] = useState('bronze');
  const [currentCo2, setCurrentCo2] = useState(0);
  const [showCuriosa, setShowCuriosa] = useState(false);

  useEffect(() => {
    const randomEmissions = Math.floor(Math.random() * 100);
    setEmissions(randomEmissions);
    
    if (randomEmissions < 20) {
      const lowEmissionsCuriosa = [
        "You've saved enough CO2 to fill 2 small balloons!",
        "Your savings could power a light bulb for 3 days!",
        "That's like not using your phone charger for a week!"
      ];
      const randomIndex = Math.floor(Math.random() * lowEmissionsCuriosa.length);
      setCuriosa(lowEmissionsCuriosa[randomIndex]);

    } else if (randomEmissions < 40) {
      const mediumLowEmissionsCuriosa = [
        "Your savings equal the CO2 absorbed by 1 tree in a year!",
        "You've prevented the same CO2 as a 5-mile car trip!",
        "That's like turning off your TV for 2 weeks!"
      ];
      const randomIndex = Math.floor(Math.random() * mediumLowEmissionsCuriosa.length);
      setCuriosa(mediumLowEmissionsCuriosa[randomIndex]);
   
    } else if (randomEmissions < 60) {
      setCuriosa("You've prevented the same CO2 as burning 5 gallons of gasoline!");
    } else if (randomEmissions < 80) {
      setCuriosa("Your impact is like taking a small car off the road for a week!");
    } else {
      setCuriosa("Amazing! You've saved enough CO2 to fill a small room!");
    }
  });

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

  useEffect(() => {
    if (user) {
      const co2Value = parseInt(user.totalCo2Saved);
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

  const handleMedalClick = () => {
    setShowRankProgress(true);
  };
  
  const handleCloseRankProgress = () => {
    setShowRankProgress(false);
  };

  const handleCo2Click = () => {
    const randomEmissions = Math.floor(Math.random() * 100);
    if (randomEmissions < 20) {
      const lowEmissionsCuriosa = [
        "You've saved enough CO2 to fill 2 small balloons!",
        "Your savings could power a light bulb for 3 days!",
        "That's like not using your phone charger for a week!"
      ];
      const randomIndex = Math.floor(Math.random() * lowEmissionsCuriosa.length);
      setCuriosa(lowEmissionsCuriosa[randomIndex]);
    } else if (randomEmissions < 40) {
      const mediumLowEmissionsCuriosa = [
        "Your savings equal the CO2 absorbed by 1 tree in a year!",
        "You've prevented the same CO2 as a 5-mile car trip!",
        "That's like turning off your TV for 2 weeks!"
      ];
      const randomIndex = Math.floor(Math.random() * mediumLowEmissionsCuriosa.length);
      setCuriosa(mediumLowEmissionsCuriosa[randomIndex]);
    } else if (randomEmissions < 60) {
      setCuriosa("You've prevented the same CO2 as burning 5 gallons of gasoline!");
    } else if (randomEmissions < 80) {
      setCuriosa("Your impact is like taking a small car off the road for a week!");
    } else {
      setCuriosa("Amazing! You've saved enough CO2 to fill a small room!");
    }
    setShowCuriosa(true);
  };

  const handleCloseCuriosa = () => {
    setShowCuriosa(false);
  };

  return (
    <div className="app">
      <button onClick={handleNextUser}>Next User</button>
      <div id = "background"> 
        <img src="/SvgIcons/Header (1).png" alt="header" style={{ position: 'absolute', top: '-2.1875rem', left: 0, width: '100%', height: '11.25rem', objectFit: 'cover', zIndex: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem', marginBottom: '2.1875rem', justifyContent: 'center', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div id="user-name">
            <p>{user ? user.name : 'Loading or user not found'}</p>
          </div>
          <div id="profile-pic" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="/SvgIcons/Edit-Profile.png" alt="Edit Profile" style={{ width: '3.125rem', height: '3.125rem', objectFit: 'contain', marginLeft: '0.625rem' }} />
          </div>
        </div>
        
        <div id="body" style={{ position: 'relative', zIndex: 1 }}>
          <div className="stats">
            <div id="rank" onClick={handleMedalClick} style={{ cursor: 'pointer' }}>
              {user && (
                <img src={medalSrc} alt="user rank medal" id="medal" />
              )}
            </div>
            <div id="co2" onClick={handleCo2Click} style={{ cursor: 'pointer' }}>
              <p>Saved Co2: <br/>{user ? user.totalCo2Saved : 'Loading or user not found'}</p>
            </div>
            <div id="reviews">
              <Link to="/reviewpage" className="avg-rating-link">
                {storedRating ? storedRating : 'No reviews yet'} / 5
              </Link>
            </div>
          </div>
          <div id="treeBox">
            <IconPicker userId={user ? user.id : null}/>
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
      {showCuriosa && (
        <>
          <div className="rank-overlay" onClick={handleCloseCuriosa}></div>
          <div className="rank-progress-container">
            <div className="rank-progress-header">
              <h3>Curiosa</h3>
              <button className="close-button" onClick={handleCloseCuriosa}>×</button>
            </div>
            <div className="rank-info">
              <p>{curiosa}</p>
            </div>
          </div>
        </>
      )}
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