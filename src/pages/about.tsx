
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 py-4">
        <h1 className="text-3xl font-bold">About Us</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Our Company</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We are a tour management company dedicated to providing exceptional
              experiences for visitors to cultural and historical sites. Our platform
              helps tour operators manage groups, assign guides, and ensure smooth
              operations for all participants.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our mission is to simplify the management of tour operations, allowing
              guides and operators to focus on delivering high-quality experiences
              to participants rather than dealing with administrative tasks.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
