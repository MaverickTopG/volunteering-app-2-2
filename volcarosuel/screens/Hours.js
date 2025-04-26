import React, { createContext, useState } from 'react';

// Create HoursContext to provide volunteer hours balance and manipulation methods
export const HoursContext = createContext({
  hours: 0,
  redeemHours: () => {},
  addHours: () => {},
});

// Provider component to wrap the app and manage hours state
export function HoursProvider({ children }) {
  const [hours, setHours] = useState(0);

  // Deduct a given number of hours (e.g., when redeeming a theme)
  const redeemHours = (cost) => {
    setHours((prev) => Math.max(prev - cost, 0));
  };

  // Add hours (e.g., after completing a volunteer session)
  const addHours = (hrs) => {
    setHours((prev) => prev + hrs);
  };

  return (
    <HoursContext.Provider value={{ hours, redeemHours, addHours }}>
      {children}
    </HoursContext.Provider>
  );
}
