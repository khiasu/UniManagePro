import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingSlot } from "@/components/booking-slot";
import type { BookingWithResource } from "@/lib/types";
import { Search, Filter, Calendar, Clock } from "lucide-react";

export default function MyBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  const { data: bookings = [], isLoading } = useQuery<BookingWithResource[]>({
    queryKey: ["/api/bookings", { user: "current-user-id" }], // TODO: Get actual user ID
  });

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      const matchesSearch = booking.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case "resource":
          return (a.resource?.name || "").localeCompare(b.resource?.name || "");
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const handleBookingClick = (booking: BookingWithResource) => {
    // TODO: Open booking details modal
    console.log("Booking clicked:", booking);
  };

  const getStatusCounts = () => {
    return {
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      pending: bookings.filter(b => b.status === "pending").length,
      ongoing: bookings.filter(b => b.status === "ongoing").length,
      completed: bookings.filter(b => b.status === "completed").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-muted-foreground">Manage and view your resource bookings</p>
        </div>
        <Button data-testid="button-new-booking">
          <Calendar className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-success">{statusCounts.confirmed}</p>
          <p className="text-sm text-muted-foreground">Confirmed</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-warning">{statusCounts.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{statusCounts.ongoing}</p>
          <p className="text-sm text-muted-foreground">Ongoing</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{statusCounts.completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-secondary-foreground">{statusCounts.cancelled}</p>
          <p className="text-sm text-muted-foreground">Cancelled</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
              data-testid="input-search-bookings"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40" data-testid="select-sort">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="resource">Sort by Resource</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" data-testid="button-advanced-filter">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters or search terms."
                : "You haven't made any bookings yet. Start by booking a resource!"
              }
            </p>
            <Button data-testid="button-create-first-booking">
              Create Your First Booking
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookingSlot
                  booking={booking}
                  onClick={handleBookingClick}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
