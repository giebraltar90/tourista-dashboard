
import React, { createContext, useContext, useState, useEffect } from 'react';

type DebugContextType = {
  debugMode: boolean;
  toggleDebugMode: () => void;
};

const DebugContext = createContext<DebugContextType>({
  debugMode: false,
  toggleDebugMode: () => {},
});

export const useDebug = () => useContext(DebugContext);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize debug mode from localStorage if available
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('debugMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Save debug mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('debugMode', JSON.stringify(debugMode));
    
    // Apply the debug mode setting to the console
    if (debugMode) {
      console.log('Debug mode activated');
    } else {
      console.log('Debug mode deactivated');
    }
  }, [debugMode]);

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  return (
    <DebugContext.Provider value={{ debugMode, toggleDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
};

// Convenience hook to access the debug state
export const useDebugMode = () => {
  const { debugMode } = useDebug();
  return debugMode;
};
