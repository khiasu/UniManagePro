import { 
  users,
  departments,
  resources,
  bookings,
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
import { eq, and, gte, lte, or, sql } from "drizzle-orm";
import { db } from "./db";

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

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData().catch(console.error);
  }

  private async initializeData() {
    try {
      // Check if data already exists
      const existingDepts = await db.select().from(departments).limit(1);
      if (existingDepts.length > 0) return; // Data already initialized

      // Initialize departments
      const depts = [
        { name: "Computer Science", code: "CS", description: "Computer Science Department", icon: "fas fa-desktop", color: "blue" },
        { name: "Chemistry", code: "CHEM", description: "Chemistry Department", icon: "fas fa-flask", color: "green" },
        { name: "Physics", code: "PHYS", description: "Physics Department", icon: "fas fa-atom", color: "purple" },
        { name: "Biology", code: "BIO", description: "Biology Department", icon: "fas fa-dna", color: "red" },
        { name: "Mathematics", code: "MATH", description: "Mathematics Department", icon: "fas fa-calculator", color: "orange" },
        { name: "General Facilities", code: "GEN", description: "General University Facilities", icon: "fas fa-building", color: "gray" },
      ];

      const insertedDepts = await db.insert(departments).values(depts).returning();

      // Get department IDs for resource creation
      const csDeptId = insertedDepts.find(d => d.code === "CS")?.id!;
      const chemDeptId = insertedDepts.find(d => d.code === "CHEM")?.id!;
      const physDeptId = insertedDepts.find(d => d.code === "PHYS")?.id!;
      const genDeptId = insertedDepts.find(d => d.code === "GEN")?.id!;

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
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
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
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
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
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
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
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
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
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
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
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
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
          workingHoursStart: "00:00",
          workingHoursEnd: "23:59",
          hasWorkingHours: false,
        },
      ];

      await db.insert(resources).values(resourcesData);

      // Initialize sample user
      await db.insert(users).values({
        username: "sarah.chen",
        email: "sarah.chen@university.edu",
        password: "hashedpassword",
        firstName: "Sarah",
        lastName: "Chen",
        role: "faculty",
        department: "Computer Science",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      });
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [dept] = await db.select().from(departments).where(eq(departments.id, id));
    return dept || undefined;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [dept] = await db.insert(departments).values(insertDepartment).returning();
    return dept;
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.isActive, true));
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async getResourcesByDepartment(departmentId: string): Promise<Resource[]> {
    return await db.select().from(resources)
      .where(and(eq(resources.departmentId, departmentId), eq(resources.isActive, true)));
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return await db.select().from(resources)
      .where(and(eq(resources.type, type), eq(resources.isActive, true)));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values({
      ...insertResource,
      isActive: true,
      workingHoursStart: insertResource.workingHoursStart || "09:00",
      workingHoursEnd: insertResource.workingHoursEnd || "15:00",
      hasWorkingHours: insertResource.hasWorkingHours ?? true,
    }).returning();
    return resource;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined> {
    const [resource] = await db.update(resources)
      .set(updates)
      .where(eq(resources.id, id))
      .returning();
    return resource || undefined;
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByResource(resourceId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.resourceId, resourceId));
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(and(gte(bookings.startTime, startDate), lte(bookings.endTime, endDate)));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values({
      ...insertBooking,
      status: 'pending',
    }).returning();
    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async cancelBooking(id: string): Promise<boolean> {
    const [booking] = await db.update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id))
      .returning();
    return !!booking;
  }

  // Utility methods
  async getResourceStatus(resourceId: string): Promise<ResourceStatus> {
    const now = new Date();
    const currentBookings = await db.select().from(bookings).where(
      and(
        eq(bookings.resourceId, resourceId),
        eq(bookings.status, 'confirmed'),
        lte(bookings.startTime, now),
        gte(bookings.endTime, now)
      )
    );

    if (currentBookings.length > 0) {
      return 'ongoing';
    }

    const futureBookings = await db.select().from(bookings).where(
      and(
        eq(bookings.resourceId, resourceId),
        eq(bookings.status, 'confirmed'),
        gte(bookings.startTime, now)
      )
    );

    return futureBookings.length > 0 ? 'booked' : 'available';
  }

  async getConflictingBookings(resourceId: string, startTime: Date, endTime: Date): Promise<Booking[]> {
    return await db.select().from(bookings).where(
      and(
        eq(bookings.resourceId, resourceId),
        sql`${bookings.status} != 'cancelled'`,
        or(
          and(lte(bookings.startTime, startTime), gte(bookings.endTime, startTime)),
          and(lte(bookings.startTime, endTime), gte(bookings.endTime, endTime)),
          and(gte(bookings.startTime, startTime), lte(bookings.endTime, endTime))
        )
      )
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

    const userBookings = await db.select().from(bookings).where(
      and(
        eq(bookings.userId, userId),
        sql`${bookings.status} != 'cancelled'`,
        gte(bookings.endTime, now)
      )
    );

    return { available, booked, ongoing, myBookings: userBookings.length };
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

export const storage = new DatabaseStorage();
