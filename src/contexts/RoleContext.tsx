
import { createContext, useContext, useState, ReactNode } from "react";

interface RoleContextType {
  guideView: boolean;
  setGuideView: (value: boolean) => void;
}

const RoleContext = createContext<RoleContextType>({
  guideView: false,
  setGuideView: () => {}
});

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [guideView, setGuideView] = useState(false);
  
  return (
    <RoleContext.Provider value={{ guideView, setGuideView }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
