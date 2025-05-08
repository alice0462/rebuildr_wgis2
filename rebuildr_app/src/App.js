import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReviewPage from './views/reviewpage';
//import Avtal from './views/avtal';
import React, { useState, useEffect } from 'react';
import IconPicker from './components/IconPicker.js';
import RankProgressBar from './components/RankProgressBar.js';
import { calculateTreeFact } from './components/CO2TreeFactsCalculator.js'; 
import html2canvas from 'html2canvas';

export function HomePage({userIndex,handleNextIndex,avgRating}) {
  
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current user index
  const [curiosa, setCuriosa] = useState('');
  const [showRankProgress, setShowRankProgress] = useState(false);
  const [currentRank, setCurrentRank] = useState('bronze');
  const [currentCo2, setCurrentCo2] = useState(0);
  const [showCuriosa, setShowCuriosa] = useState(false);
  const [showDownload, setDownload] = useState(false);

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

  const handleDownload = () => {
    setDownload(true);
  };
  
  const handleCloseDownload = () => {
    setDownload(false);
  };

  const handleDownloadTreeBox = () => {
    const element = document.getElementById('treeBox');
    const plusBtn = document.querySelector('.plus-button');
    const downloadBtn = document.querySelector('.emailSignature');
    
    if (!element) return;

    plusBtn && (plusBtn.style.display = 'none');
    downloadBtn && (downloadBtn.style.display = 'none');
  
    html2canvas(element).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'treeBox.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });

    plusBtn && (plusBtn.style.display = '');
    downloadBtn && (downloadBtn.style.display = '');
  };

  const handleCo2Click = async () => {
    if (user && user.id) {
      try {
        const treeFact = await calculateTreeFact(user.id);
        setCuriosa(treeFact);
        setShowCuriosa(true);
      } catch (error) {
        console.error('Error fetching tree fact:', error);
        setCuriosa('Error fetching tree fact. Please try again later.');  
        setShowCuriosa(true);
      }
    }
  };

  const handleCloseCuriosa = () => {
    setShowCuriosa(false);
  };

  return (
    <div className="app">
      <div id = "background"> 
        <div style={{ position: 'absolute', width: '100%' }}>
          <img src="/SvgIcons/figma_pic1.png" alt="figma1" style={{ position: 'absolute', top: '-25.5rem', left: '0rem', width: '100%', zIndex: 2 }}/>
          <img src="/SvgIcons/Header (1).png" alt="header" style={{ position: 'absolute', top: '-27rem', left: '0rem', width: '100%', zIndex: 1, opacity: 0.4 }}/>

        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', marginRight: '2rem'}}>
          <div id="user-name">
            <p>User?{user ? user.name : 'Loading or user not found'}</p>
          </div>
          <div id="profile-pic" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <img src="/SvgIcons/Edit-Profile.png" alt="Edit Profile" />
          </div>
          </div>
        
        <div id="body" style={{ position: 'relative', zIndex: 1 }}>
        <div className='handleUser'> <button onClick={handleNextIndex}>User</button> </div>
          <div className="stats">
            <div id="rank" onClick={handleMedalClick} style={{ cursor: 'pointer' }}>
              {user && (
                <img src={medalSrc} alt="user rank medal" id="medal" />
              )}
            </div>
            <div id="co2" onClick={handleCo2Click} style={{ cursor: 'pointer' }}>
              <p>Saved Co2: <br/>{user ? user.co2_saved : 'Loading or user not found'}</p>
            </div>
            <div id="reviews">
              <Link to="/reviewpage" className="avg-rating-link">
                <p>{avgRating} / 5</p>
              </Link>
            </div>
          </div>
          <div id="treeBox">
            <IconPicker userId={user ? user.id : null}/>
            <div className='emailSignature'  onClick={handleDownload} style={{ cursor: 'pointer' }}>
              <img src="/SvgIcons/Download.png" alt="download" className="download-icon"/>
              
    
            </div>

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

{showDownload && (
  <>
    <div className="rank-overlay" onClick={handleCloseDownload}></div>
    <div className="rank-progress-container">
      <div className="rank-progress-header">
        <h3>Download to pdf?</h3>
        
      </div>
      <div className="rank-info">
        
          <div className='yesNo-buttons'>
            <button id="yes-button" onClick={handleDownloadTreeBox}>Yes</button>
            <button id="no-button" onClick={handleCloseDownload}>No</button>
          </div>
      </div>
    </div>
  </>
)}
      {showCuriosa && (
        <>
          <div className="rank-overlay" onClick={handleCloseCuriosa}></div>
          <div className="rank-progress-container">
            <div className="rank-progress-header">
              <h3>Congrats!</h3>
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