
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the guide view type
export interface GuideView {
  type: string;
  guideName: string;
}

interface RoleContextType {
  guideView: GuideView | null;
  adminView: boolean;
  role: string;
  toggleGuideView: () => void;
  toggleAdminView: () => void;
  setRole: (role: string) => void;
  setGuideView: (view: GuideView | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [guideView, setGuideView] = useState<GuideView | null>(null);
  const [adminView, setAdminView] = useState(false);
  const [role, setRole] = useState<string>("operator"); // Default role is operator

  const toggleGuideView = () => {
    if (guideView) {
      setGuideView(null);
    } else {
      setGuideView({ type: "guide", guideName: "Preview Guide" });
    }
  };

  const toggleAdminView = () => {
    setAdminView(prev => !prev);
  };

  return (
    <RoleContext.Provider value={{ 
      guideView, 
      adminView, 
      role,
      toggleGuideView, 
      toggleAdminView,
      setRole,
      setGuideView
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
