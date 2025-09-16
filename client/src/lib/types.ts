import type { User, Department, Resource, Booking, ResourceStatus } from "@shared/schema";

export interface ResourceWithStatus extends Resource {
  department?: Department;
  status: ResourceStatus;
}

export interface BookingWithResource extends Booking {
  resource?: Resource;
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
