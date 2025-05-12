import React, { createContext, useContext, useState } from 'react';

// Create context
const UserContext = createContext();

// Provider component to manage shared state
export function IndexPicker({ children }) {
  const [userId, setUserId] = useState(1); // Shared state

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to access shared state
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
      throw new Error('useUser must be used within a UserProvider');
    }
    return context;
  }