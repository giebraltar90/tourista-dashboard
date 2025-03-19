
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-7xl font-semibold text-foreground">404</h1>
          <h2 className="text-2xl font-medium text-foreground">Page not found</h2>
          <p className="text-muted-foreground mx-auto max-w-[28rem] mt-2">
            We couldn't find the page you were looking for. The link might be incorrect, or the page may have been moved or deleted.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
