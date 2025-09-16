import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { QuickBookFormData } from "@/lib/types";

const quickBookSchema = z.object({
  resourceType: z.string().min(1, "Resource type is required"),
  date: z.string().min(1, "Date is required"),
  duration: z.number().min(1, "Duration must be at least 1 hour").max(8, "Duration cannot exceed 8 hours"),
  purpose: z.string().min(1, "Purpose is required").max(200, "Purpose must be less than 200 characters"),
  attendees: z.number().min(1, "At least 1 attendee is required").max(500, "Too many attendees"),
});

interface QuickBookFormProps {
  onSubmit: (data: QuickBookFormData) => void;
  isLoading?: boolean;
}

const resourceTypes = [
  { value: "computer_lab", label: "Computer Lab" },
  { value: "chemistry_lab", label: "Chemistry Lab" },
  { value: "physics_lab", label: "Physics Lab" },
  { value: "biology_lab", label: "Biology Lab" },
  { value: "auditorium", label: "Auditorium" },
  { value: "seminar_hall", label: "Seminar Hall" },
  { value: "sports_court", label: "Sports Court" },
];

const durations = [
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 3, label: "3 hours" },
  { value: 4, label: "4 hours" },
  { value: 6, label: "6 hours" },
  { value: 8, label: "8 hours" },
];

export function QuickBookForm({ onSubmit, isLoading = false }: QuickBookFormProps) {
  const form = useForm<QuickBookFormData>({
    resolver: zodResolver(quickBookSchema),
    defaultValues: {
      resourceType: "",
      date: "",
      duration: 2,
      purpose: "",
      attendees: 1,
    },
  });

  const handleSubmit = (data: QuickBookFormData) => {
    onSubmit(data);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Quick Book</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="resourceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-resource-type">
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        data-testid={`option-${type.value}`}
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={today}
                      {...field}
                      data-testid="input-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-duration">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem 
                          key={duration.value} 
                          value={duration.value.toString()}
                          data-testid={`option-duration-${duration.value}`}
                        >
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <FormLabel>Number of Attendees</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    data-testid="input-attendees"
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
                    placeholder="Brief description of the booking purpose..."
                    className="resize-none"
                    {...field}
                    data-testid="textarea-purpose"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-find-slots"
          >
            {isLoading ? "Searching..." : "Find Available Slots"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
