import React, { useState, useEffect } from 'react';
export function Purchase() {
    const [purchase, setPurchase] = useState([]);
    useEffect(() => {
        fetch('/data/purchase_db.json')
        .then((res) => res.json())
        .then((data) => setPurchase(data))
        .catch((err) => console.error('Error loading user data:', err));
    }, []);

    const userPurchases = purchase.filter((purchase) => purchase.seller_id === 1);
    console.log(userPurchases[0])
  return (
      <div className='body'>
        <p></p>
      </div>
    );
  }
export default Purchase;

