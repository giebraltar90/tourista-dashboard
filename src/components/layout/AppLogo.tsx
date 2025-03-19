
import { useState, useEffect } from "react";
import { getAppLogo } from "@/services/settingsService";

// Default logo to use as fallback
const DEFAULT_LOGO = "/lovable-uploads/8b1b9ca2-3a0a-4744-9b6a-a65bc97e8958.png";

export function AppLogo() {
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const logoUrl = await getAppLogo();
        setLogo(logoUrl);
      } catch (error) {
        console.error("Failed to load logo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogo();
  }, []);

  if (isLoading) {
    return <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>;
  }

  return (
    <img 
      src={logo} 
      alt="App Logo" 
      className="h-8 w-auto"
      onError={() => setLogo(DEFAULT_LOGO)}
    />
  );
}
