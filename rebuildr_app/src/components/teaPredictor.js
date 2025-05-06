import React, { useState } from 'react';

function teaPredictor() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/predict-tea');
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      setError('Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePredict} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict if I will drink tea'}
      </button>
      {prediction && <p>Prediction: {prediction}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default teaPredictor;