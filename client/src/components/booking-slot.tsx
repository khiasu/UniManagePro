import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BookingWithResource } from "@/lib/types";
import { Clock, User, MapPin } from "lucide-react";

interface BookingSlotProps {
  booking: BookingWithResource;
  onClick?: (booking: BookingWithResource) => void;
}

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    className: "bg-success text-success-foreground",
  },
  pending: {
    label: "Pending",
    className: "bg-warning text-warning-foreground",
  },
  ongoing: {
    label: "In Progress",
    className: "bg-destructive text-destructive-foreground",
  },
  completed: {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-secondary text-secondary-foreground",
  },
};

export function BookingSlot({ booking, onClick }: BookingSlotProps) {
  const config = statusConfig[booking.status as keyof typeof statusConfig];
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  const formatTimeRange = () => {
    const start = formatTime(booking.startTime);
    const end = formatTime(booking.endTime);
    return `${start} - ${end}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="booking-slot bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors cursor-pointer"
      onClick={() => onClick?.(booking)}
      data-testid={`booking-slot-${booking.id}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-card-foreground" data-testid={`text-booking-resource-${booking.id}`}>
          {booking.resource?.name || "Unknown Resource"}
        </span>
        <span 
          className={cn("text-xs px-2 py-1 rounded-full", config.className)}
          data-testid={`status-booking-${booking.status}-${booking.id}`}
        >
          {config.label}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3" />
          <span data-testid={`text-booking-time-${booking.id}`}>
            {formatTimeRange()}
          </span>
        </div>
        
        {booking.purpose && (
          <div className="flex items-start space-x-2">
            <User className="w-3 h-3 mt-0.5" />
            <span className="truncate" data-testid={`text-booking-purpose-${booking.id}`}>
              {booking.purpose}
            </span>
          </div>
        )}
        
        {booking.resource?.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-3 h-3" />
            <span className="text-xs" data-testid={`text-booking-location-${booking.id}`}>
              {booking.resource.location}
            </span>
          </div>
        )}
      </div>
      
      {booking.attendees && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground" data-testid={`text-booking-attendees-${booking.id}`}>
            {booking.attendees} attendees
          </span>
        </div>
      )}
    </motion.div>
  );
}
