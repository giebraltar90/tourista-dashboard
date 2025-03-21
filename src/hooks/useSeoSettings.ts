
import { useState, useEffect } from "react";
import { getOgImage, getFavicon, DEFAULT_OG_IMAGE, DEFAULT_FAVICON } from "@/services/settingsService";

export function useSeoSettings() {
  const [ogImage, setOgImage] = useState<string>(DEFAULT_OG_IMAGE);
  const [favicon, setFavicon] = useState<string>(DEFAULT_FAVICON);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadSeoSettings() {
      try {
        setIsLoading(true);
        const [ogImageUrl, faviconUrl] = await Promise.all([
          getOgImage(),
          getFavicon()
        ]);
        
        setOgImage(ogImageUrl);
        setFavicon(faviconUrl);
        
        // Update meta tags in the document
        if (window.updateMetaTags) {
          window.updateMetaTags(ogImageUrl, faviconUrl);
        }
      } catch (err) {
        console.error("Failed to load SEO settings:", err);
        setError(err instanceof Error ? err : new Error("Failed to load SEO settings"));
      } finally {
        setIsLoading(false);
      }
    }

    loadSeoSettings();
  }, []);

  return { ogImage, favicon, isLoading, error };
}
