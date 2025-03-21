
import { useState } from "react";
import { TourCard, TourCardProps } from "../tours/TourCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useTours } from "@/hooks/useTourData";
import { UpcomingToursProps } from "./UpcomingTours.d";
import { useGuideTours } from "@/hooks/useGuideData";
import { useRole } from "@/contexts/RoleContext";
import { Link } from "react-router-dom";

export function UpcomingTours({ tours: propTours }: UpcomingToursProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const { guideView } = useRole();
  
  // Use guide tours if in guide view, otherwise use all tours
  const { data: guideTours, isLoading: guideToursLoading, error: guideToursError } = useGuideTours();
  const { data: apiTours, isLoading: allToursLoading, error: allToursError } = useTours({
    enabled: !propTours && !guideView
  });
  
  // Determine which tours to use
  const useApiTours = guideView ? guideTours : apiTours;
  const isLoading = guideView ? guideToursLoading : allToursLoading;
  const error = guideView ? guideToursError : allToursError;
  
  // Use provided tours from props if available, otherwise use tours from API
  const tours: TourCardProps[] = propTours || useApiTours || [];
  
  // Filter tours based on search query and location filter
  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.tourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.guide1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tour.guide2 && tour.guide2.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation =
      locationFilter === "all" || tour.location.includes(locationFilter);

    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter dropdown
  const uniqueLocations = Array.from(
    new Set(tours.map((tour) => tour.location))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold">
          {guideView ? "My Upcoming Tours" : "Upcoming Tours"}
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tours..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!propTours && isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !propTours && error ? (
        <div className="text-center py-8 text-red-500">
          Failed to load tours. Please try again.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredTours.length > 0 ? (
              filteredTours.map((tour) => <TourCard key={tour.id} {...tour} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tours found matching your search criteria.
              </div>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <Link to="/tours">
              <Button variant="outline">View All Tours</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
