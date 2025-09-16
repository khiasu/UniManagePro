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
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().min(1, "Purpose is required").max(200, "Purpose must be less than 200 characters"),
  attendees: z.number().min(1, "At least 1 attendee required").max(500, "Too many attendees"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingModal({ isOpen, onClose, resource }: BookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });
  
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
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
      
      return apiRequest("POST", "/api/bookings", {
        resourceId: resource.id,
        userId: currentUser.id,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
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

  // Get today's date and time for min datetime
  const now = new Date();
  const today = now.toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="booking-modal">
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
          </motion.div>

          {/* Booking Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                        <Input
                          type="datetime-local"
                          min={today}
                          {...field}
                          data-testid="input-start-time"
                        />
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
                        <Input
                          type="datetime-local"
                          min={today}
                          {...field}
                          data-testid="input-end-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  disabled={bookingMutation.isPending}
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