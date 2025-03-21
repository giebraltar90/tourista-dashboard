
import { useState, useEffect } from "react";
import { getAppLogo, DEFAULT_LOGO } from "@/services/settingsService";

export function AppLogo() {
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const logoUrl = await getAppLogo();
        console.log("Loaded app logo:", logoUrl);
        setLogo(logoUrl);
      } catch (error) {
        console.error("Failed to load logo:", error);
        setHasError(true);
        // Fall back to default logo
        setLogo(DEFAULT_LOGO);
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
      onError={() => {
        console.error("Error loading logo image, falling back to default");
        setLogo(DEFAULT_LOGO);
      }}
    />
  );
}
