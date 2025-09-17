import { z } from "zod";

// Simple types for in-memory database
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  profileImage?: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon: string;
  color: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  departmentId: string;
  capacity: number;
  equipment?: string[];
  description?: string;
  location: string;
  isActive: boolean;
  requiresApproval: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  hasWorkingHours: boolean;
  createdAt: Date;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  purpose: string;
  attendees: number;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

// Validation schemas
export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  department: z.string(),
  profileImage: z.string().optional(),
});

export const insertDepartmentSchema = z.object({
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  icon: z.string(),
  color: z.string(),
});

export const insertResourceSchema = z.object({
  name: z.string(),
  type: z.string(),
  departmentId: z.string(),
  capacity: z.number(),
  equipment: z.array(z.string()).optional(),
  description: z.string().optional(),
  location: z.string(),
  requiresApproval: z.boolean().optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  hasWorkingHours: z.boolean().optional(),
});

export const insertBookingSchema = z.object({
  resourceId: z.string(),
  userId: z.string(),
  purpose: z.string(),
  attendees: z.number(),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Status types
export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
export type ResourceStatus = 'available' | 'booked' | 'ongoing' | 'maintenance';
export type UserRole = 'student' | 'faculty';
