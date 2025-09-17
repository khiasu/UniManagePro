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

      // Get department IDs for resource creation
      const bioDeptId = insertedDepts.find(d => d.code === "BIO")?.id!;
      const mathDeptId = insertedDepts.find(d => d.code === "MATH")?.id!;

      // Initialize resources with comprehensive university labs
      const resourcesData = [
        // Computer Science Labs
        {
          name: "Computer Science Lab 1",
          type: "computer_lab",
          departmentId: csDeptId,
          capacity: 30,
          equipment: ["30 Workstations", "Projector", "Smart Board", "Network Infrastructure"],
          description: "Main programming lab with latest software development tools",
          location: "CS Building, Room 201",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        {
          name: "Computer Science Lab 2",
          type: "computer_lab",
          departmentId: csDeptId,
          capacity: 25,
          equipment: ["25 Workstations", "Interactive Whiteboard", "Server Rack"],
          description: "Software engineering and database systems laboratory",
          location: "CS Building, Room 205",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        {
          name: "AI & Machine Learning Lab",
          type: "computer_lab",
          departmentId: csDeptId,
          capacity: 20,
          equipment: ["High-Performance Workstations", "GPU Clusters", "Research Servers"],
          description: "Specialized lab for AI research and machine learning projects",
          location: "CS Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "22:00",
          hasWorkingHours: true,
        },
        // Chemistry Labs
        {
          name: "Organic Chemistry Lab",
          type: "chemistry_lab",
          departmentId: chemDeptId,
          capacity: 24,
          equipment: ["Fume Hoods", "Lab Benches", "Safety Showers", "Chemical Storage"],
          description: "Organic synthesis and analysis laboratory",
          location: "Chemistry Building, Room 101",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        {
          name: "Analytical Chemistry Lab",
          type: "chemistry_lab",
          departmentId: chemDeptId,
          capacity: 20,
          equipment: ["HPLC", "GC-MS", "UV-Vis Spectrophotometer", "Balance Room"],
          description: "Advanced instrumentation for chemical analysis",
          location: "Chemistry Building, Room 201",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        {
          name: "Physical Chemistry Lab",
          type: "chemistry_lab",
          departmentId: chemDeptId,
          capacity: 16,
          equipment: ["Calorimeters", "Electrochemical Workstations", "Laser Equipment"],
          description: "Laboratory for thermodynamics and kinetics experiments",
          location: "Chemistry Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        // Physics Labs
        {
          name: "General Physics Lab",
          type: "physics_lab",
          departmentId: physDeptId,
          capacity: 24,
          equipment: ["Lab Benches", "Basic Equipment Sets", "Digital Multimeters"],
          description: "Introductory physics experiments laboratory",
          location: "Physics Building, Room 101",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        {
          name: "Electronics Lab",
          type: "physics_lab",
          departmentId: physDeptId,
          capacity: 20,
          equipment: ["Oscilloscopes", "Function Generators", "Power Supplies", "Breadboards"],
          description: "Electronics and circuits laboratory",
          location: "Physics Building, Room 201",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        {
          name: "Optics & Photonics Lab",
          type: "physics_lab",
          departmentId: physDeptId,
          capacity: 16,
          equipment: ["Laser Systems", "Optical Benches", "Spectrometers", "Interferometers"],
          description: "Advanced optics research laboratory",
          location: "Physics Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        // Biology Labs
        {
          name: "Molecular Biology Lab",
          type: "biology_lab",
          departmentId: bioDeptId,
          capacity: 20,
          equipment: ["PCR Machines", "Gel Electrophoresis", "Centrifuges", "Incubators"],
          description: "DNA/RNA analysis and molecular cloning laboratory",
          location: "Biology Building, Room 201",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        {
          name: "Cell Culture Lab",
          type: "biology_lab",
          departmentId: bioDeptId,
          capacity: 12,
          equipment: ["Biosafety Cabinets", "CO2 Incubators", "Microscopes", "Cell Counters"],
          description: "Sterile cell culture and tissue engineering facility",
          location: "Biology Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        {
          name: "Microbiology Lab",
          type: "biology_lab",
          departmentId: bioDeptId,
          capacity: 24,
          equipment: ["Autoclaves", "Laminar Flow Hoods", "Microscopes", "Culture Media Prep"],
          description: "Microbial cultivation and analysis laboratory",
          location: "Biology Building, Room 101",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        // Mathematics Computer Lab
        {
          name: "Mathematical Computing Lab",
          type: "computer_lab",
          departmentId: mathDeptId,
          capacity: 25,
          equipment: ["Workstations", "MATLAB", "Mathematica", "Statistical Software"],
          description: "Computational mathematics and statistics laboratory",
          location: "Mathematics Building, Room 201",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        // General University Facilities
        {
          name: "Main Auditorium",
          type: "auditorium",
          departmentId: genDeptId,
          capacity: 500,
          equipment: ["Professional Sound System", "Stage Lighting", "Projection System", "Recording Equipment"],
          description: "Main university auditorium for conferences and large events",
          location: "Main Building, Ground Floor",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "22:00",
          hasWorkingHours: true,
        },
        {
          name: "Lecture Hall A",
          type: "auditorium",
          departmentId: genDeptId,
          capacity: 150,
          equipment: ["Audio System", "Projector", "Document Camera", "Wireless Microphones"],
          description: "Large lecture hall for undergraduate courses",
          location: "Academic Block A, Room 101",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        {
          name: "Seminar Room A",
          type: "seminar_hall",
          departmentId: genDeptId,
          capacity: 30,
          equipment: ["Interactive Display", "Video Conferencing", "Flexible Seating"],
          description: "Modern seminar room for small group discussions",
          location: "Academic Block B, Room 201",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        {
          name: "Conference Room",
          type: "seminar_hall",
          departmentId: genDeptId,
          capacity: 20,
          equipment: ["Conference Table", "Video Conferencing", "Whiteboard", "Coffee Station"],
          description: "Executive conference room for meetings and presentations",
          location: "Administration Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          hasWorkingHours: true,
        },
        // Sports Facilities
        {
          name: "Indoor Basketball Court",
          type: "sports_court",
          departmentId: genDeptId,
          capacity: 100,
          equipment: ["Professional Hoops", "Scoreboard", "Bleachers", "Sound System"],
          description: "Regulation basketball court for sports and events",
          location: "Sports Complex, Main Gym",
          requiresApproval: false,
          workingHoursStart: "06:00",
          workingHoursEnd: "22:00",
          hasWorkingHours: false,
        },
        {
          name: "Multipurpose Sports Hall",
          type: "sports_court",
          departmentId: genDeptId,
          capacity: 150,
          equipment: ["Volleyball Nets", "Badminton Courts", "Storage Equipment"],
          description: "Flexible sports facility for various indoor activities",
          location: "Sports Complex, Hall B",
          requiresApproval: false,
          workingHoursStart: "06:00",
          workingHoursEnd: "22:00",
          hasWorkingHours: false,
        },
        {
          name: "Outdoor Soccer Field",
          type: "sports_ground",
          departmentId: genDeptId,
          capacity: 200,
          equipment: ["Goals", "Field Markings", "Bleachers", "Lighting"],
          description: "Official soccer field with spectator seating",
          location: "Sports Complex, Outdoor Fields",
          requiresApproval: false,
          workingHoursStart: "06:00",
          workingHoursEnd: "22:00",
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
      // Extract time only for comparison
      const startTimeOnly = startTime.getUTCHours() * 60 + startTime.getUTCMinutes();
      const endTimeOnly = endTime.getUTCHours() * 60 + endTime.getUTCMinutes();
      
      const [startHour, startMin] = resource.workingHoursStart!.split(':').map(Number);
      const [endHour, endMin] = resource.workingHoursEnd!.split(':').map(Number);
      
      const workingStartMinutes = startHour * 60 + startMin;
      const workingEndMinutes = endHour * 60 + endMin;
      
      if (startTimeOnly < workingStartMinutes || endTimeOnly > workingEndMinutes) {
        return { valid: false, message: `Booking time is outside of working hours (${resource.workingHoursStart} - ${resource.workingHoursEnd})` };
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
