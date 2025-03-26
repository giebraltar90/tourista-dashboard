
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const HomePage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to tours page for now
    navigate("/tours");
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Tour Management</h1>
        <p className="max-w-md mx-auto text-muted-foreground">
          Manage your tours, groups, and guides efficiently
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate("/tours")}>View Tours</Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
