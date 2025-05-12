import React from 'react';
import './RankProgressBar.css';

const RankProgressBar = ({ currentCo2, currentRank, onClose }) => {
  const rankThresholds = {
    bronze: { min: 0, max: 1122, next: 'silver' },
    silver: { min: 1122.5, max: 2177, next: 'gold' },
    gold: { min: 2177, max: Infinity, next: null }
  };

  const calculateProgress = () => {
    const currentThreshold = rankThresholds[currentRank];
    const nextThreshold = currentRank === 'gold' ? null : rankThresholds[currentThreshold.next];
    
    if (!nextThreshold) {
      return 100; 
    }
    
    const range = nextThreshold.min - currentThreshold.min;
    const progress = ((currentCo2 - currentThreshold.min) / range) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getNextRankName = () => {
    if (currentRank === 'gold') return 'Maximum Rank';
    return rankThresholds[currentRank].next.charAt(0).toUpperCase() + 
           rankThresholds[currentRank].next.slice(1);
  };

  const getRemainingCo2 = () => {
    if (currentRank === 'gold') return 0;
    const nextThreshold = rankThresholds[rankThresholds[currentRank].next];
    return Math.max(0, nextThreshold.min - currentCo2);
  };

  const progress = calculateProgress();
  const nextRank = getNextRankName();
  const remainingCo2 = getRemainingCo2();

  return (
    <div className="rank-progress-container">
      <div className="rank-progress-header">
        <h3>Rank Progress</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="rank-info">
        <p>Current Rank: <span className={`rank-name ${currentRank}`}>{currentRank.charAt(0).toUpperCase() + currentRank.slice(1)}</span></p>
        <p>Next Rank: <span className={`rank-name ${currentRank === 'gold' ? 'gold' : rankThresholds[currentRank].next}`}>{nextRank}</span></p>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="progress-info">
        <p>{progress.toFixed(1)}% to {nextRank}</p>
        {remainingCo2 > 0 && (
          <p>Save {remainingCo2} kg more CO₂ to reach {nextRank}</p>
        )}
      </div>
    </div>
  );
};

export default RankProgressBar; 