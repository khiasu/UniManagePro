import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResourceCard } from "@/components/resource-card";
import { BookingSlot } from "@/components/booking-slot";
import { QuickBookForm } from "@/components/quick-book-form";
import { BookingModal } from "@/components/booking-modal";
import { useToast } from "@/hooks/use-toast";
import type { ResourceWithStatus, BookingWithResource, DashboardStats, QuickBookFormData } from "@/lib/types";
import type { Department } from "@shared/schema";
import { 
  CheckCircle, 
  CalendarCheck, 
  PlayCircle, 
  Watch, 
  Plus,
  Calendar,
  History,
  Settings,
  Search,
  Filter,
} from "lucide-react";

const quickActionItems = [
  { icon: Plus, label: "Book Resource", variant: "primary" as const },
  { icon: Calendar, label: "View Calendar", variant: "success" as const },
  { icon: History, label: "Booking History", variant: "warning" as const },
  { icon: Settings, label: "Settings", variant: "purple" as const },
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<ResourceWithStatus | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: resources = [] } = useQuery<ResourceWithStatus[]>({
    queryKey: ["/api/resources"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: todayBookings = [] } = useQuery<BookingWithResource[]>({
    queryKey: ["/api/bookings", { date: new Date().toISOString().split('T')[0] }],
  });

  // Filter resources based on search and department
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.department?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || resource.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleBookResource = (resource: ResourceWithStatus) => {
    setSelectedResource(resource);
    setIsBookingModalOpen(true);
  };

  const handleViewSchedule = (resource: ResourceWithStatus) => {
    toast({
      title: "View Schedule",
      description: `Showing schedule for ${resource.name}`,
    });
    // TODO: Open schedule view
  };

  const handleQuickBook = (data: QuickBookFormData) => {
    // Find available resources matching the criteria
    const availableResources = resources.filter(resource => 
      resource.type === data.resourceType && 
      resource.status === 'available' &&
      resource.capacity >= data.attendees
    );
    
    if (availableResources.length > 0) {
      // For demo, select the first available resource
      const bestMatch = availableResources[0];
      setSelectedResource(bestMatch);
      setIsBookingModalOpen(true);
      toast({
        title: "Resource Found",
        description: `Opening booking form for ${bestMatch.name}`,
      });
    } else {
      toast({
        title: "No Available Resources",
        description: `No ${data.resourceType.replace('_', ' ')} available for ${data.attendees} attendees on ${data.date}`,
        variant: "destructive",
      });
    }
  };

  const handleBookingClick = (booking: BookingWithResource) => {
    toast({
      title: "Booking Details",
      description: `Opening details for ${booking.resource?.name}`,
    });
    // TODO: Open booking details
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid="card-available-resources">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Now</p>
              <p className="text-2xl font-bold text-success" data-testid="text-available-count">
                {stats?.available || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid="card-booked-resources">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <CalendarCheck className="text-warning w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booked Today</p>
              <p className="text-2xl font-bold text-warning" data-testid="text-booked-count">
                {stats?.booked || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid="card-ongoing-sessions">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
              <PlayCircle className="text-destructive w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ongoing</p>
              <p className="text-2xl font-bold text-destructive" data-testid="text-ongoing-count">
                {stats?.ongoing || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow" data-testid="card-my-bookings">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Watch className="text-primary w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">My Bookings</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-my-bookings-count">
                {stats?.myBookings || 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center p-4 hover:bg-accent rounded-lg transition-colors group"
                data-testid={`button-quick-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className={`w-12 h-12 bg-${item.variant}/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-${item.variant}/20 transition-colors`}>
                  <Icon className={`text-${item.variant} w-6 h-6`} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Available Resources */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Resources</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                  data-testid="input-search-resources"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48" data-testid="select-department-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" data-testid="button-filter">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4"
          >
            {filteredResources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-resources">
                No resources found matching your criteria.
              </div>
            ) : (
              filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ResourceCard
                    resource={resource}
                    onBook={handleBookResource}
                    onViewSchedule={handleViewSchedule}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {todayBookings.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm" data-testid="text-no-bookings">
                  No bookings for today.
                </p>
              ) : (
                todayBookings.slice(0, 3).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <BookingSlot
                      booking={booking}
                      onClick={handleBookingClick}
                    />
                  </motion.div>
                ))
              )}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4" 
              size="sm"
              data-testid="button-view-full-calendar"
            >
              View Full Calendar
            </Button>
          </motion.div>

          {/* Quick Book Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickBookForm onSubmit={handleQuickBook} />
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedResource(null);
        }}
        resource={selectedResource}
      />
    </div>
  );
}
