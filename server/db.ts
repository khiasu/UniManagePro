// Simple in-memory database for local development
// No compilation required - just works!

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

// In-memory storage
export const db = {
  users: [] as User[],
  departments: [] as Department[],
  resources: [] as Resource[],
  bookings: [] as Booking[],
};

// Helper functions
export const generateId = () => Math.random().toString(36).substr(2, 9);

console.log('✅ In-memory database initialized successfully');
console.log('📝 Note: Data will be reset when server restarts');
