import { 
  type User, 
  type InsertUser,
  type Department,
  type InsertDepartment,
  type Resource,
  type InsertResource,
  type Booking,
  type InsertBooking,
  type BookingStatus,
  type ResourceStatus
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Departments
  getAllDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Resources
  getAllResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  getResourcesByDepartment(departmentId: string): Promise<Resource[]>;
  getResourcesByType(type: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined>;

  // Bookings
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByResource(resourceId: string): Promise<Booking[]>;
  getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | undefined>;
  cancelBooking(id: string): Promise<boolean>;

  // Utility methods
  getResourceStatus(resourceId: string): Promise<ResourceStatus>;
  getConflictingBookings(resourceId: string, startTime: Date, endTime: Date): Promise<Booking[]>;
  getDashboardStats(userId: string): Promise<{
    available: number;
    booked: number;
    ongoing: number;
    myBookings: number;
  }>;
  isBookingTimeValid(resourceId: string, startTime: Date, endTime: Date): Promise<{ valid: boolean; message?: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private departments: Map<string, Department> = new Map();
  private resources: Map<string, Resource> = new Map();
  private bookings: Map<string, Booking> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize departments
    const depts = [
      { name: "Computer Science", code: "CS", description: "Computer Science Department", icon: "fas fa-desktop", color: "blue" },
      { name: "Chemistry", code: "CHEM", description: "Chemistry Department", icon: "fas fa-flask", color: "green" },
      { name: "Physics", code: "PHYS", description: "Physics Department", icon: "fas fa-atom", color: "purple" },
      { name: "Biology", code: "BIO", description: "Biology Department", icon: "fas fa-dna", color: "red" },
      { name: "Mathematics", code: "MATH", description: "Mathematics Department", icon: "fas fa-calculator", color: "orange" },
      { name: "General Facilities", code: "GEN", description: "General University Facilities", icon: "fas fa-building", color: "gray" },
    ];

    depts.forEach(dept => {
      const id = randomUUID();
      this.departments.set(id, { ...dept, id });
    });

    // Get department IDs for resource creation
    const csDeptId = Array.from(this.departments.values()).find(d => d.code === "CS")?.id!;
    const chemDeptId = Array.from(this.departments.values()).find(d => d.code === "CHEM")?.id!;
    const physDeptId = Array.from(this.departments.values()).find(d => d.code === "PHYS")?.id!;
    const genDeptId = Array.from(this.departments.values()).find(d => d.code === "GEN")?.id!;

    // Initialize resources
    const resourcesData = [
      {
        name: "Computer Lab 1",
        type: "computer_lab",
        departmentId: csDeptId,
        capacity: 30,
        equipment: ["Computers", "Projector", "Whiteboard"],
        description: "Main computer lab with latest hardware",
        location: "CS Building, Floor 2",
        requiresApproval: false,
      },
      {
        name: "Computer Lab 2",
        type: "computer_lab",
        departmentId: csDeptId,
        capacity: 25,
        equipment: ["Computers", "Smart Board"],
        description: "Secondary computer lab for programming courses",
        location: "CS Building, Floor 3",
        requiresApproval: false,
      },
      {
        name: "Organic Chemistry Lab",
        type: "chemistry_lab",
        departmentId: chemDeptId,
        capacity: 24,
        equipment: ["Lab Equipment", "Fume Hood", "Safety Equipment"],
        description: "Advanced chemistry laboratory",
        location: "Chemistry Building, Floor 1",
        requiresApproval: true,
      },
      {
        name: "Physics Lab A",
        type: "physics_lab",
        departmentId: physDeptId,
        capacity: 20,
        equipment: ["Oscilloscopes", "Function Generators", "Lab Benches"],
        description: "Electronics and circuits laboratory",
        location: "Physics Building, Floor 2",
        requiresApproval: false,
      },
      {
        name: "Main Auditorium",
        type: "auditorium",
        departmentId: genDeptId,
        capacity: 500,
        equipment: ["Sound System", "Stage", "Projector", "Lighting"],
        description: "Main university auditorium for large events",
        location: "Main Building, Ground Floor",
        requiresApproval: true,
      },
      {
        name: "Seminar Hall A",
        type: "seminar_hall",
        departmentId: genDeptId,
        capacity: 50,
        equipment: ["Projector", "Sound System", "Conference Table"],
        description: "Medium-sized seminar hall",
        location: "Academic Block, Floor 1",
        requiresApproval: false,
      },
      {
        name: "Basketball Court",
        type: "sports_court",
        departmentId: genDeptId,
        capacity: 100,
        equipment: ["Basketball Hoops", "Scoreboard", "Benches"],
        description: "Indoor basketball court",
        location: "Sports Complex",
        requiresApproval: false,
      },
    ];

    resourcesData.forEach(resource => {
      const id = randomUUID();
      
      // Set working hours based on resource type
      let workingHoursStart = "09:00";
      let workingHoursEnd = "15:00";
      let hasWorkingHours = true;
      
      // Courts and grounds don't have working hour restrictions
      if (resource.type === "sports_court" || resource.type === "sports_ground") {
        hasWorkingHours = false;
        workingHoursStart = "00:00";
        workingHoursEnd = "23:59";
      }
      
      this.resources.set(id, { 
        ...resource, 
        id, 
        isActive: true,
        workingHoursStart,
        workingHoursEnd,
        hasWorkingHours,
        createdAt: new Date()
      });
    });

    // Initialize sample user
    const userId = randomUUID();
    this.users.set(userId, {
      id: userId,
      username: "sarah.chen",
      email: "sarah.chen@university.edu",
      password: "hashedpassword",
      firstName: "Sarah",
      lastName: "Chen",
      role: "faculty",
      department: "Computer Science",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      createdAt: new Date(),
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      profileImage: insertUser.profileImage || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const department: Department = { 
      ...insertDepartment, 
      id,
      description: insertDepartment.description || null
    };
    this.departments.set(id, department);
    return department;
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(r => r.isActive);
  }

  async getResource(id: string): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async getResourcesByDepartment(departmentId: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(r => 
      r.departmentId === departmentId && r.isActive
    );
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(r => 
      r.type === type && r.isActive
    );
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = randomUUID();
    const resource: Resource = { 
      ...insertResource, 
      id,
      description: insertResource.description || null,
      equipment: insertResource.equipment || null,
      requiresApproval: insertResource.requiresApproval || false,
      isActive: true,
      workingHoursStart: insertResource.workingHoursStart || "09:00",
      workingHoursEnd: insertResource.workingHoursEnd || "15:00",
      hasWorkingHours: insertResource.hasWorkingHours ?? true,
      createdAt: new Date()
    };
    this.resources.set(id, resource);
    return resource;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...updates };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.userId === userId);
  }

  async getBookingsByResource(resourceId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.resourceId === resourceId);
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => 
      b.startTime >= startDate && b.endTime <= endDate
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id,
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    booking.status = status;
    this.bookings.set(id, booking);
    return booking;
  }

  async cancelBooking(id: string): Promise<boolean> {
    const booking = this.bookings.get(id);
    if (!booking) return false;
    
    booking.status = 'cancelled';
    this.bookings.set(id, booking);
    return true;
  }

  // Utility methods
  async getResourceStatus(resourceId: string): Promise<ResourceStatus> {
    const now = new Date();
    const currentBookings = Array.from(this.bookings.values()).filter(b => 
      b.resourceId === resourceId && 
      b.status === 'confirmed' &&
      b.startTime <= now && 
      b.endTime > now
    );

    if (currentBookings.length > 0) {
      return 'ongoing';
    }

    const futureBookings = Array.from(this.bookings.values()).filter(b => 
      b.resourceId === resourceId && 
      b.status === 'confirmed' &&
      b.startTime > now
    );

    return futureBookings.length > 0 ? 'booked' : 'available';
  }

  async getConflictingBookings(resourceId: string, startTime: Date, endTime: Date): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => 
      b.resourceId === resourceId &&
      b.status !== 'cancelled' &&
      ((b.startTime <= startTime && b.endTime > startTime) ||
       (b.startTime < endTime && b.endTime >= endTime) ||
       (b.startTime >= startTime && b.endTime <= endTime))
    );
  }

  async getDashboardStats(userId: string): Promise<{
    available: number;
    booked: number;
    ongoing: number;
    myBookings: number;
  }> {
    const allResources = await this.getAllResources();
    const now = new Date();
    
    let available = 0;
    let booked = 0;
    let ongoing = 0;

    for (const resource of allResources) {
      const status = await this.getResourceStatus(resource.id);
      switch (status) {
        case 'available':
          available++;
          break;
        case 'booked':
          booked++;
          break;
        case 'ongoing':
          ongoing++;
          break;
      }
    }

    const myBookings = (await this.getBookingsByUser(userId)).filter(b => 
      b.status !== 'cancelled' && b.endTime > now
    ).length;

    return { available, booked, ongoing, myBookings };
  }

  async isBookingTimeValid(resourceId: string, startTime: Date, endTime: Date): Promise<{ valid: boolean; message?: string }> {
    const resource = await this.getResource(resourceId);
    if (!resource) {
      return { valid: false, message: 'Resource not found' };
    }

    if (resource.hasWorkingHours) {
      const workingHoursStart = new Date('1970-01-01T' + resource.workingHoursStart + 'Z');
      const workingHoursEnd = new Date('1970-01-01T' + resource.workingHoursEnd + 'Z');
      if (startTime < workingHoursStart || endTime > workingHoursEnd) {
        return { valid: false, message: 'Booking time is outside of working hours' };
      }
    }

    const conflictingBookings = await this.getConflictingBookings(resourceId, startTime, endTime);
    if (conflictingBookings.length > 0) {
      return { valid: false, message: 'Booking time conflicts with existing bookings' };
    }

    return { valid: true };
  }
}

export const storage = new MemStorage();
