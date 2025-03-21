
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
        updateMetaTagsDirectly(ogImageUrl, faviconUrl);
      } catch (err) {
        console.error("Failed to load SEO settings:", err);
        setError(err instanceof Error ? err : new Error("Failed to load SEO settings"));
      } finally {
        setIsLoading(false);
      }
    }

    loadSeoSettings();
  }, []);

  // Function to update meta tags directly
  const updateMetaTagsDirectly = (ogImageUrl: string, faviconUrl: string) => {
    try {
      console.log("Updating meta tags directly with:", { ogImageUrl, faviconUrl });
      
      // First try using the window function if available
      if (window.updateMetaTags) {
        console.log("Using window.updateMetaTags function");
        window.updateMetaTags(ogImageUrl || DEFAULT_OG_IMAGE, faviconUrl || DEFAULT_FAVICON);
        return;
      }
      
      // If window function isn't available, update manually
      console.log("Falling back to manual meta tag updates");
      
      // Update OG image
      if (ogImageUrl) {
        // Update multiple OG meta tags for better compatibility with messaging apps
        const metaTags = [
          { property: 'og:image', id: 'og-image' },
          { property: 'og:image:url', id: 'og-image-url' },
          { property: 'og:image:secure_url', id: 'og-image-secure' },
          { property: 'twitter:image', id: 'twitter-image' }
        ];
        
        metaTags.forEach(tag => {
          let element = document.querySelector(`meta[property="${tag.property}"]`) as HTMLMetaElement;
          
          if (!element) {
            // Create the meta tag if it doesn't exist
            element = document.createElement('meta');
            element.setAttribute('property', tag.property);
            if (tag.id) element.setAttribute('id', tag.id);
            document.head.appendChild(element);
          }
          
          element.setAttribute('content', ogImageUrl);
          console.log(`Updated ${tag.property} to:`, ogImageUrl);
        });
      }
      
      // Update favicon
      if (faviconUrl) {
        const faviconElement = document.getElementById('favicon') as HTMLLinkElement;
        if (faviconElement) {
          faviconElement.setAttribute('href', faviconUrl);
          console.log("Updated favicon link to:", faviconUrl);
        } else {
          console.warn("Favicon element not found in the document");
        }
      }
    } catch (error) {
      console.error("Error updating meta tags directly:", error);
    }
  };

  return { ogImage, favicon, isLoading, error, updateMetaTags: updateMetaTagsDirectly };
}
