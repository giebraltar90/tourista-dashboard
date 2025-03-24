
import { createContext, useContext, useState, ReactNode } from "react";

export type GuideViewType = {
  type: string;
  guideName: string;
} | null;

interface RoleContextType {
  guideView: GuideViewType;
  setGuideView: (value: GuideViewType) => void;
  role?: string;
  setRole?: (value: string) => void;
}

const RoleContext = createContext<RoleContextType>({
  guideView: null,
  setGuideView: () => {},
  role: "operator",
  setRole: () => {}
});

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [guideView, setGuideView] = useState<GuideViewType>(null);
  const [role, setRole] = useState<string>("operator");
  
  return (
    <RoleContext.Provider value={{ guideView, setGuideView, role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
