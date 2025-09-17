import type { User, Department, Booking, ResourceStatus } from "@shared/schema";

export interface ResourceWithStatus extends Omit<import("@shared/schema").Resource, 'workingHoursStart' | 'workingHoursEnd' | 'hasWorkingHours'> {
  department?: Department;
  status: ResourceStatus;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  hasWorkingHours?: boolean;
}

export interface BookingWithResource extends Booking {
  resource?: import("@shared/schema").Resource;
}

export interface DashboardStats {
  available: number;
  booked: number;
  ongoing: number;
  myBookings: number;
}

export interface QuickBookFormData {
  resourceType: string;
  date: string;
  duration: number;
  purpose: string;
  attendees: number;
}

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  path?: string;
  isActive?: boolean;
};
