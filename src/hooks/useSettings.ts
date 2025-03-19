
import { useState, useEffect } from "react";
import { getAppLogo, DEFAULT_LOGO } from "@/services/settingsService";

export function useLogoSettings() {
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadLogo() {
      try {
        setIsLoading(true);
        const logoUrl = await getAppLogo();
        setLogo(logoUrl);
      } catch (err) {
        console.error("Failed to load logo:", err);
        setError(err instanceof Error ? err : new Error("Failed to load logo"));
      } finally {
        setIsLoading(false);
      }
    }

    loadLogo();
  }, []);

  return { logo, isLoading, error };
}
