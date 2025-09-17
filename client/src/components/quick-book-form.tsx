import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ResourceWithStatus } from "@/lib/types";
import { Calendar, Clock, Users, BookOpen, Zap } from "lucide-react";

const quickBookSchema = z.object({
  resourceType: z.string().min(1, "Please select a resource type"),
  selectedDate: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  purpose: z.string().min(1, "Purpose is required").max(200, "Purpose must be less than 200 characters"),
  attendees: z.number().min(1, "At least 1 attendee required").max(500, "Too many attendees"),
});

type QuickBookFormData = z.infer<typeof quickBookSchema>;

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

// Comprehensive resource types for UGC universities
const resourceTypes = [
  { value: "computer_lab", label: "Computer Lab", icon: "💻", hours: { start: 9, end: 15 } },
  { value: "chemistry_lab", label: "Chemistry Lab", icon: "🧪", hours: { start: 9, end: 15 } },
  { value: "physics_lab", label: "Physics Lab", icon: "⚛️", hours: { start: 9, end: 15 } },
  { value: "biology_lab", label: "Biology Lab", icon: "🔬", hours: { start: 9, end: 15 } },
  { value: "mechanical_lab", label: "Mechanical Lab", icon: "⚙️", hours: { start: 9, end: 15 } },
  { value: "electrical_lab", label: "Electrical Lab", icon: "⚡", hours: { start: 9, end: 15 } },
  { value: "electronics_lab", label: "Electronics Lab", icon: "📡", hours: { start: 9, end: 15 } },
  { value: "civil_lab", label: "Civil Engineering Lab", icon: "🏗️", hours: { start: 9, end: 15 } },
  { value: "medical_lab", label: "Medical Lab", icon: "🏥", hours: { start: 9, end: 15 } },
  { value: "art_studio", label: "Art Studio", icon: "🎨", hours: { start: 9, end: 15 } },
  { value: "music_room", label: "Music Room", icon: "🎵", hours: { start: 9, end: 15 } },
  { value: "commerce_lab", label: "Business Lab", icon: "💼", hours: { start: 9, end: 15 } },
  { value: "moot_court", label: "Moot Court", icon: "⚖️", hours: { start: 9, end: 15 } },
  { value: "library", label: "Library", icon: "📚", hours: { start: 8, end: 20 } },
  { value: "auditorium", label: "Auditorium", icon: "🎭", hours: { start: 9, end: 21 } },
  { value: "seminar_hall", label: "Seminar Hall", icon: "🏛️", hours: { start: 9, end: 17 } },
  { value: "conference_room", label: "Conference Room", icon: "🤝", hours: { start: 9, end: 17 } },
  { value: "sports_court", label: "Sports Court", icon: "🏀", hours: { start: 6, end: 22 } },
  { value: "sports_facility", label: "Sports Facility", icon: "🏊", hours: { start: 6, end: 20 } },
  { value: "sports_ground", label: "Sports Ground", icon: "⚽", hours: { start: 6, end: 22 } },
];

export function QuickBookForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("");

  const { data: resources = [] } = useQuery<ResourceWithStatus[]>({
    queryKey: ["/api/resources"],
  });

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const form = useForm<QuickBookFormData>({
    resolver: zodResolver(quickBookSchema),
    defaultValues: {
      resourceType: "",
      selectedDate: "",
      startTime: "",
      endTime: "",
      purpose: "",
      attendees: 1,
    },
  });

  const quickBookMutation = useMutation({
    mutationFn: async (data: QuickBookFormData) => {
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Find available resource of selected type
      const availableResources = resources.filter(r => 
        r.type === data.resourceType && r.status === 'available'
      );

      if (availableResources.length === 0) {
        throw new Error(`No available ${resourceTypes.find(rt => rt.value === data.resourceType)?.label} found`);
      }

      // Use the first available resource
      const resource = availableResources[0];

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
      const resourceTypeLabel = resourceTypes.find(rt => rt.value === selectedResourceType)?.label;
      toast({
        title: "Quick Booking Successful",
        description: `Your ${resourceTypeLabel} has been booked successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      form.reset();
      setSelectedDate("");
      setSelectedStartTime("");
      setSelectedEndTime("");
      setSelectedResourceType("");
    },
    onError: (error: any) => {
      toast({
        title: "Quick Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: QuickBookFormData) => {
    quickBookMutation.mutate(data);
  };

  const next7Days = getNext7Days();
  
  // Get working hours for selected resource type
  const selectedResourceTypeData = resourceTypes.find(rt => rt.value === selectedResourceType);
  const workingHours = selectedResourceTypeData?.hours || { start: 9, end: 15 };
  const timeSlots = generateTimeSlots(workingHours.start, workingHours.end);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quick Book</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          
          {/* Resource Type Selection */}
          <FormField
            control={form.control}
            name="resourceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedResourceType(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60">
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          {selectedResourceType && (
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
                    <div className="grid grid-cols-2 gap-2">
                      {next7Days.slice(0, 4).map((day) => (
                        <Button
                          key={day.date}
                          type="button"
                          variant={selectedDate === day.date ? "default" : "outline"}
                          size="sm"
                          className="h-auto p-2 flex flex-col items-center"
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
          )}

          {/* Time Selection */}
          {selectedDate && (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Start
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                        {timeSlots.slice(0, 8).map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedStartTime === time ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
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
                      End
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                        {timeSlots
                          .filter(time => !selectedStartTime || time > selectedStartTime)
                          .slice(0, 8)
                          .map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedEndTime === time ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
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

          {/* Attendees */}
          {selectedStartTime && selectedEndTime && (
            <>
              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Attendees
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="Number of attendees"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={quickBookMutation.isPending}
              >
                {quickBookMutation.isPending ? "Booking..." : "Quick Book"}
              </Button>
            </>
          )}
        </form>
      </Form>

      {/* Working Hours Info */}
      {selectedResourceType && (
        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
          <BookOpen className="w-3 h-3 inline mr-1" />
          {selectedResourceTypeData?.label} hours: {workingHours.start}:00 - {workingHours.end}:00
        </div>
      )}
    </div>
  );
}
