
import { useState, useEffect } from "react";
import { getOgImage, getFavicon, DEFAULT_OG_IMAGE, DEFAULT_FAVICON, updateOgImage, updateFavicon } from "@/services/settingsService";

// Add TypeScript declaration for the window.updateMetaTags function
declare global {
  interface Window {
    updateMetaTags?: (ogImageUrl: string, faviconUrl: string) => void;
    debugSeoSettings?: () => { ogImage: string, favicon: string };
  }
}

export function useSeoSettings() {
  const [ogImage, setOgImage] = useState<string>(DEFAULT_OG_IMAGE);
  const [favicon, setFavicon] = useState<string>(DEFAULT_FAVICON);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load SEO settings
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
        
        // Apply meta tags immediately after loading
        if (ogImageUrl || faviconUrl) {
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

    // Run once at startup and when the route changes
    const handleRouteChange = () => {
      console.log("Route changed, updating meta tags");
      loadSeoSettings();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // Debug helper
    if (window.debugSeoSettings) {
      const currentSettings = window.debugSeoSettings();
      console.log("Current SEO settings from DOM:", currentSettings);
    }
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Function to update meta tags directly with improved debugging
  const updateMetaTagsDirectly = (ogImageUrl: string, faviconUrl: string) => {
    try {
      console.log("Updating meta tags directly with:", { ogImageUrl, faviconUrl });
      
      // Try to make absolute URLs
      const makeAbsoluteUrl = (url: string) => {
        if (!url) return url;
        if (url.startsWith('http')) return url;
        if (url.startsWith('data:')) return url; // data URLs are already absolute
        
        const baseDomain = window.location.origin;
        return `${baseDomain}${url.startsWith('/') ? '' : '/'}${url}`;
      };
      
      const absoluteOgUrl = makeAbsoluteUrl(ogImageUrl || DEFAULT_OG_IMAGE);
      const absoluteFaviconUrl = makeAbsoluteUrl(faviconUrl || DEFAULT_FAVICON);
      
      console.log("Using absolute URLs:", { og: absoluteOgUrl, favicon: absoluteFaviconUrl });
      
      // First try using the window function if available
      if (window.updateMetaTags) {
        console.log("Using window.updateMetaTags function");
        window.updateMetaTags(absoluteOgUrl, absoluteFaviconUrl);
        return;
      }
      
      // If window function isn't available, update manually
      console.log("Falling back to manual meta tag updates");
      
      // Update OG image tags
      if (absoluteOgUrl) {
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
          
          element.setAttribute('content', absoluteOgUrl);
          console.log(`Updated ${tag.property} to:`, absoluteOgUrl);
        });
      }
      
      // Update favicon
      if (absoluteFaviconUrl) {
        const faviconElement = document.getElementById('favicon') as HTMLLinkElement;
        if (faviconElement) {
          faviconElement.setAttribute('href', absoluteFaviconUrl);
          console.log("Updated favicon link to:", absoluteFaviconUrl);
        } else {
          console.warn("Favicon element not found in the document");
        }
      }
      
      // Force a refresh of meta tags
      const metaRefresh = document.createElement('meta');
      metaRefresh.httpEquiv = 'refresh';
      metaRefresh.content = '0';
      document.head.appendChild(metaRefresh);
      setTimeout(() => {
        document.head.removeChild(metaRefresh);
      }, 100);
      
    } catch (error) {
      console.error("Error updating meta tags directly:", error);
    }
  };

  // Save and update SEO settings
  const saveSeoSettings = async (newOgImage: string, newFavicon: string): Promise<boolean> => {
    try {
      console.log("Saving SEO settings:", { og: newOgImage, favicon: newFavicon });
      
      let success = true;
      
      if (newOgImage && newOgImage !== ogImage) {
        const ogSuccess = await updateOgImage(newOgImage);
        if (ogSuccess) {
          setOgImage(newOgImage);
        }
        success = success && ogSuccess;
      }
      
      if (newFavicon && newFavicon !== favicon) {
        const faviconSuccess = await updateFavicon(newFavicon);
        if (faviconSuccess) {
          setFavicon(newFavicon);
        }
        success = success && faviconSuccess;
      }
      
      if (success) {
        // Update meta tags immediately
        updateMetaTagsDirectly(newOgImage, newFavicon);
      }
      
      return success;
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      return false;
    }
  };

  return { 
    ogImage, 
    favicon, 
    isLoading, 
    error, 
    updateMetaTags: updateMetaTagsDirectly,
    saveSeoSettings
  };
}
