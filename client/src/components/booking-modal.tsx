import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ResourceWithStatus } from "@/lib/types";
import { Calendar, Clock, Users, MapPin, X } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceWithStatus | null;
}

const bookingSchema = z.object({
  selectedDate: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  purpose: z.string().min(1, "Purpose is required").max(200, "Purpose must be less than 200 characters"),
  attendees: z.number().min(1, "At least 1 attendee required").max(500, "Too many attendees"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Generate next 7 days
const getNext7Days = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }
  return days;
};

// Generate time slots based on working hours
const generateTimeSlots = (startHour: number, endHour: number) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export function BookingModal({ isOpen, onClose, resource }: BookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  
  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });
  
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      selectedDate: "",
      startTime: "",
      endTime: "",
      purpose: "",
      attendees: 1,
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      if (!resource) throw new Error("No resource selected");
      
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      // Combine date and time to create full datetime
      const startDateTime = new Date(`${data.selectedDate}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.selectedDate}T${data.endTime}:00`);
      
      return apiRequest("POST", "/api/bookings", {
        resourceId: resource.id,
        userId: currentUser.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: data.purpose,
        attendees: data.attendees,
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Created Successfully",
        description: `Your booking for ${resource?.name} has been confirmed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
      form.reset();
      setSelectedDate("");
      setSelectedStartTime("");
      setSelectedEndTime("");
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  if (!resource) return null;

  const next7Days = getNext7Days();
  
  // Get working hours for time slot generation
  const workingStartHour = resource.hasWorkingHours 
    ? parseInt(resource.workingHoursStart?.split(':')[0] || '9') 
    : 9;
  const workingEndHour = resource.hasWorkingHours 
    ? parseInt(resource.workingHoursEnd?.split(':')[0] || '15') 
    : 19;
  
  const timeSlots = generateTimeSlots(workingStartHour, workingEndHour);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="booking-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book {resource.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-booking-modal">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 rounded-lg p-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Capacity
                </p>
                <p className="font-medium">{resource.capacity} people</p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{resource.department?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </p>
                <p className="font-medium text-xs">{resource.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  resource.status === 'available' ? 'bg-success text-success-foreground' :
                  resource.status === 'booked' ? 'bg-warning text-warning-foreground' :
                  resource.status === 'ongoing' ? 'bg-destructive text-destructive-foreground' :
                  'bg-secondary text-secondary-foreground'
                }`}>
                  {resource.status}
                </span>
              </div>
            </div>
            
            {/* Working Hours Info */}
            {resource.hasWorkingHours && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Clock className="w-3 h-3" />
                  Working Hours: {resource.workingHoursStart} - {resource.workingHoursEnd}
                </p>
              </div>
            )}
            {!resource.hasWorkingHours && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Clock className="w-3 h-3" />
                  Available 24/7
                </p>
              </div>
            )}
          </motion.div>

          {/* Booking Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Date Selection */}
              <FormField
                control={form.control}
                name="selectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Select Date
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {next7Days.map((day) => (
                          <Button
                            key={day.date}
                            type="button"
                            variant={selectedDate === day.date ? "default" : "outline"}
                            className="h-auto p-3 flex flex-col items-center"
                            onClick={() => {
                              setSelectedDate(day.date);
                              field.onChange(day.date);
                            }}
                          >
                            <span className="text-xs font-medium">{day.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(day.date).getDate()}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Selection */}
              {selectedDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Start Time
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={selectedStartTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setSelectedStartTime(time);
                                  field.onChange(time);
                                  // Clear end time if it's before or equal to start time
                                  if (selectedEndTime && selectedEndTime <= time) {
                                    setSelectedEndTime("");
                                    form.setValue("endTime", "");
                                  }
                                }}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          End Time
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                            {timeSlots
                              .filter(time => !selectedStartTime || time > selectedStartTime)
                              .map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={selectedEndTime === time ? "default" : "outline"}
                                size="sm"
                                disabled={!selectedStartTime}
                                onClick={() => {
                                  setSelectedEndTime(time);
                                  field.onChange(time);
                                }}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Number of Attendees
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={resource.capacity}
                        placeholder={`Max ${resource.capacity} people`}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-booking-attendees"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Booking</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of how you'll use this resource..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="textarea-booking-purpose"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-booking"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bookingMutation.isPending || !selectedDate || !selectedStartTime || !selectedEndTime}
                  data-testid="button-confirm-booking"
                >
                  {bookingMutation.isPending ? "Creating..." : "Confirm Booking"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}