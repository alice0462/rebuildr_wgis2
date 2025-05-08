import React, { createContext, useContext, useState } from 'react';

// Create context
const UserIndexContext = createContext();

// Provider component
export function UserIndexProvider({ children }) {
  const [userIndex, setUserIndex] = useState(1); // Initialize to 1

  // Ensure userIndex stays between 1 and 10
  const updateUserIndex = (newIndex) => {
    if (newIndex >= 1 && newIndex <= 10) {
      setUserIndex(newIndex);
    }
  };

  return (
    <UserIndexContext.Provider value={{ userIndex, setUserIndex: updateUserIndex }}>
      {children}
    </UserIndexContext.Provider>
  );
}

// Custom hook to access context
export function useUserIndex() {
  return useContext(UserIndexContext);
}