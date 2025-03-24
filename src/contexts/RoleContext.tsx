
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RoleContextType {
  guideView: boolean;
  adminView: boolean;
  toggleGuideView: () => void;
  toggleAdminView: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [guideView, setGuideView] = useState(false);
  const [adminView, setAdminView] = useState(false);

  const toggleGuideView = () => {
    setGuideView(prev => !prev);
  };

  const toggleAdminView = () => {
    setAdminView(prev => !prev);
  };

  return (
    <RoleContext.Provider value={{ 
      guideView, 
      adminView, 
      toggleGuideView, 
      toggleAdminView 
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
