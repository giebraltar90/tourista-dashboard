
import { useState, useEffect } from "react";
import { getOgImage, getFavicon, DEFAULT_OG_IMAGE, DEFAULT_FAVICON } from "@/services/settingsService";

// Add TypeScript declaration for the window.updateMetaTags function
declare global {
  interface Window {
    updateMetaTags?: (ogImageUrl: string, faviconUrl: string) => void;
  }
}

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
        
        console.log("Loaded SEO settings:", { ogImageUrl, faviconUrl });
        setOgImage(ogImageUrl);
        setFavicon(faviconUrl);
        
        // Update meta tags in the document
        if (window.updateMetaTags) {
          window.updateMetaTags(ogImageUrl, faviconUrl);
        } else {
          // Direct DOM manipulation if the function isn't available
          updateMetaTagsDirectly(ogImageUrl, faviconUrl);
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

  // Fallback function to update meta tags directly if the window function isn't available
  const updateMetaTagsDirectly = (ogImageUrl: string, faviconUrl: string) => {
    try {
      // Update OG image
      if (ogImageUrl) {
        const ogImageElement = document.getElementById('og-image') as HTMLMetaElement;
        if (ogImageElement) {
          ogImageElement.setAttribute('content', ogImageUrl);
          console.log("Updated OG image meta tag to:", ogImageUrl);
        }
      }
      
      // Update favicon
      if (faviconUrl) {
        const faviconElement = document.getElementById('favicon') as HTMLLinkElement;
        if (faviconElement) {
          faviconElement.setAttribute('href', faviconUrl);
          console.log("Updated favicon link to:", faviconUrl);
        }
      }
    } catch (error) {
      console.error("Error updating meta tags directly:", error);
    }
  };

  return { ogImage, favicon, isLoading, error };
}
