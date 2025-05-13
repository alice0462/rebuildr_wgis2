import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReviewPage from './views/reviewpage';
import Purchase from './views/purchase.js';
//import Avtal from './views/avtal';
import React, { useState, useEffect } from 'react';
import IconPicker from './components/IconPicker.js';
import RankProgressBar from './components/RankProgressBar.js';
import { calculateTreeFact } from './components/CO2TreeFactsCalculator.js'; 
import html2canvas from 'html2canvas';
import StarRating from "./components/StarRating.js";

export function HomePage({userIndex,handleNextIndex,avgRating,co2Savings}) {
  
  const [users, setUsers] = useState([]);
  //const [currentIndex, setCurrentIndex] = useState(0); // Track current user index
  const [curiosa, setCuriosa] = useState('');
  const [showRankProgress, setShowRankProgress] = useState(false);
  const [currentRank, setCurrentRank] = useState('bronze');
  const [currentCo2, setCurrentCo2] = useState(0);
  const [showCuriosa, setShowCuriosa] = useState(false);
  const [showDownload, setDownload] = useState(false);
  const [showInfo, setInfo] = useState(false);


useEffect(() => {
    fetch('/data/user_db.json')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error loading user data:', err));
  }, []);
  
  const user = users[userIndex];
  
  useEffect(() => {
    if (user) {
      const co2Value = co2Savings[userIndex].co2_savings;
      setCurrentCo2(co2Value);
      
      if (co2Value < 1122) {
        setCurrentRank('bronze');
      } else if (co2Value < 2177) {
        setCurrentRank('silver');
      } else {
        setCurrentRank('gold');
      }
    }
  }, [user]);

  let medalSrc = '';
  if (user) {
    const co2Value = co2Savings[userIndex].co2_savings; // extracts number from "435 kg"
    if (co2Value < 1122) {
      medalSrc = '/images/bronze-medal2.svg';
    } else if (co2Value < 2177) {
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

  const handleShowInfo = () => {
    setInfo(true);
  };
  
  const handleCloseInfo= () => {
    setInfo(false);
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
    const infoBtn = document.querySelector('.infoBox')
    
    if (!element) return;

    element.classList.add('transparent-export');
    plusBtn && (plusBtn.style.display = 'none');
    downloadBtn && (downloadBtn.style.display = 'none');
    infoBtn && (infoBtn.style.display = 'none');
  
    html2canvas(element, { backgroundColor: null }).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'treeBox.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });

    element.classList.remove('transparent-export');
    plusBtn && (plusBtn.style.display = '');
    downloadBtn && (downloadBtn.style.display = '');
    infoBtn && (infoBtn.style.display = '');
  };

  const handleCo2Click = async () => {
    if (user && user.user_id !== undefined)
      {
      try {
        const treeFact = await calculateTreeFact(user.user_id,co2Savings);
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
          <img src="/SvgIcons/figma_pic1.png" alt="figma1" style={{ position: 'absolute', top: '-25.5rem', left: '0rem', width: '100%', zIndex: 1 }}/>
          <img src="/SvgIcons/Header (1).png" alt="header" style={{ position: 'absolute', top: '-27rem', left: '0rem', width: '100%', zIndex: 1, opacity: 0.4 }}/>

        </div>
        <div onClick={handleNextIndex} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', marginRight: '2rem'}}>
          <div id="user-name">
            <p>{user ? user.username : 'Loading or user not found'}</p>
          </div>
          <div id="profile-pic" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <img src="/SvgIcons/Edit-Profile.png" alt="Edit Profile" />
          </div>
          </div>
        
        <div id="body" style={{ position: 'relative', zIndex: 1 }}>
        <div className='handleUser'>  </div>
          <div className="stats">
            <div id="rank" onClick={handleMedalClick} style={{ cursor: 'pointer' }}>
              {user && (
                <img src={medalSrc} alt="user rank medal" id="medal" />
              )}
            </div>
            <div id="co2" onClick={handleCo2Click} style={{ cursor: 'pointer' }}>
              <p>Saved Co2: <br/>{co2Savings[userIndex].co2_savings}</p>
            </div>
            <div id="reviews">
              <div id="reviews">
                <Link to="/reviewpage" className="avg-rating-link">
                  <StarRating avgRating={avgRating} />
                </Link>
              </div>
            </div>
          </div>
          <div id="treeBox">
            <IconPicker co2Savings={co2Savings} userId={user ? user.user_id : null}/>
            <div className='emailSignature'  onClick={handleDownload} style={{ cursor: 'pointer' }}>
              <img src="/SvgIcons/Download.png" alt="download" className="download-icon"/>
            </div>
            
            <div className='infoBox' onClick={handleShowInfo} style={{ cursor: 'pointer' }}>
              <img src="/SvgIcons/Info.png" alt="info" className="info-icon"/>
            </div>

          </div>
        </div>
      </div>
      {showRankProgress && (
        <>
          
          <RankProgressBar 
            currentCo2={currentCo2}
            currentRank={currentRank}
            onClose={handleCloseRankProgress}
          />
        </>
      )}

{showDownload && (
  <>
    <div className="rank-progress-container">
      <div className="rank-progress-header">
        <h3>Download to PNG?</h3>
        
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

{showInfo && (
  <>
    <div className="rank-progress-container">
      <div className="rank-progress-header">
        <h3>Information</h3>
        <button className="close-button" onClick={handleCloseInfo}>×</button>
      </div>
      <p>Click the plus button to customize your tree. <br/>
        Drag icons to position them, and unlock more features by saving additional CO₂.<br/>
         If you want to remove one specific icon, double tap on it. <br/> </p>
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

  const [co2Savings, setCo2Savings] = useState([0]);
  
  useEffect(() => {
      fetch(`http://localhost:8080/co2-savings/all` ,{
        method:"GET"
      })
      .then((response) => response.json())
      .then(data => setCo2Savings(data))
      .catch(error => console.error(error));
  }, []);
  console.log(co2Savings)  

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
        co2Savings={co2Savings}
        />} />
        <Route path="/reviewpage" element={<ReviewPage 
        userIndex={userIndex} 
        handleNextIndex={handleNextIndex}
        userReviews={userReviews}
        avgRating={avgRating} 
        />} />
        <Route path="/purchase" element={<Purchase/>} />
      </Routes>
    </Router>
  );
}


export default App;
