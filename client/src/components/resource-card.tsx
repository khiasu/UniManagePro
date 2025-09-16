import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ResourceWithStatus } from "@/lib/types";
import { 
  Computer, 
  FlaskConical, 
  Atom, 
  Dna, 
  Calculator, 
  Building, 
  Users, 
  MapPin,
  Clock,
  Theater,
} from "lucide-react";

interface ResourceCardProps {
  resource: ResourceWithStatus;
  onBook: (resource: ResourceWithStatus) => void;
  onViewSchedule: (resource: ResourceWithStatus) => void;
}

const resourceTypeIcons = {
  computer_lab: Computer,
  chemistry_lab: FlaskConical,
  physics_lab: Atom,
  biology_lab: Dna,
  auditorium: Theater,
  seminar_hall: Building,
  sports_court: Users,
};

const statusConfig = {
  available: {
    label: "Available",
    className: "status-available",
    nextAvailable: "Now",
    nextAvailableClass: "text-success",
    actionLabel: "Book Now",
    actionVariant: "default" as const,
  },
  booked: {
    label: "Booked",
    className: "status-booked", 
    nextAvailable: "3:00 PM",
    nextAvailableClass: "text-warning",
    actionLabel: "View Schedule",
    actionVariant: "secondary" as const,
  },
  ongoing: {
    label: "Ongoing",
    className: "status-ongoing",
    nextAvailable: "5:00 PM", 
    nextAvailableClass: "text-destructive",
    actionLabel: "Join Queue",
    actionVariant: "secondary" as const,
  },
  maintenance: {
    label: "Maintenance",
    className: "status-acquired",
    nextAvailable: "Tomorrow",
    nextAvailableClass: "text-muted-foreground",
    actionLabel: "Notify Me",
    actionVariant: "secondary" as const,
  },
};

export function ResourceCard({ resource, onBook, onViewSchedule }: ResourceCardProps) {
  const IconComponent = resourceTypeIcons[resource.type as keyof typeof resourceTypeIcons] || Building;
  const config = statusConfig[resource.status];

  const handleAction = () => {
    if (resource.status === "available") {
      onBook(resource);
    } else {
      onViewSchedule(resource);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="resource-card bg-card border border-border rounded-xl p-6 cursor-pointer transition-all"
      data-testid={`card-resource-${resource.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <IconComponent className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-card-foreground" data-testid={`text-resource-name-${resource.id}`}>
              {resource.name}
            </h4>
            <p className="text-sm text-muted-foreground" data-testid={`text-resource-department-${resource.id}`}>
              {resource.department?.name || "Unknown Department"}
            </p>
          </div>
        </div>
        <span 
          className={cn("px-3 py-1 rounded-full text-xs font-medium", config.className)}
          data-testid={`status-${resource.status}-${resource.id}`}
        >
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            Capacity
          </p>
          <p className="font-medium" data-testid={`text-capacity-${resource.id}`}>
            {resource.capacity} {resource.type.includes('lab') ? 'stations' : 'seats'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Equipment</p>
          <p className="font-medium truncate" data-testid={`text-equipment-${resource.id}`}>
            {resource.equipment?.slice(0, 2).join(", ") || "Standard equipment"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Next Available
          </p>
          <p className={cn("font-medium", config.nextAvailableClass)} data-testid={`text-next-available-${resource.id}`}>
            {config.nextAvailable}
          </p>
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleAction}
            variant={config.actionVariant}
            size="sm"
            className="w-full text-sm"
            data-testid={`button-${resource.status === 'available' ? 'book' : 'schedule'}-${resource.id}`}
          >
            {config.actionLabel}
          </Button>
        </div>
      </div>

      {resource.location && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {resource.location}
          </p>
        </div>
      )}
    </motion.div>
  );
}
