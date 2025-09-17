import { db, generateId, type User, type Department, type Resource, type Booking } from "./db";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;

  // Departments
  getAllDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: Partial<Department>): Promise<Department>;

  // Resources
  getAllResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  getResourcesByDepartment(departmentId: string): Promise<Resource[]>;
  getResourcesByType(type: string): Promise<Resource[]>;
  createResource(resource: Partial<Resource>): Promise<Resource>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined>;

  // Bookings
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByResource(resourceId: string): Promise<Booking[]>;
  getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]>;
  createBooking(booking: Partial<Booking>): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  cancelBooking(id: string): Promise<boolean>;

  // Utility methods
  getResourceStatus(resourceId: string): Promise<string>;
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
      if (db.departments.length > 0) return; // Data already initialized

      // Initialize departments with comprehensive UGC university coverage
      const depts = [
        // Core Science Departments
        { name: "Computer Science & Engineering", code: "CSE", description: "Computer Science & Engineering Department", icon: "fas fa-desktop", color: "blue" },
        { name: "Information Technology", code: "IT", description: "Information Technology Department", icon: "fas fa-laptop", color: "cyan" },
        { name: "Chemistry", code: "CHEM", description: "Chemistry Department", icon: "fas fa-flask", color: "green" },
        { name: "Physics", code: "PHYS", description: "Physics Department", icon: "fas fa-atom", color: "purple" },
        { name: "Mathematics", code: "MATH", description: "Mathematics Department", icon: "fas fa-calculator", color: "orange" },
        { name: "Biology", code: "BIO", description: "Biology Department", icon: "fas fa-dna", color: "red" },
        { name: "Biotechnology", code: "BIOTECH", description: "Biotechnology Department", icon: "fas fa-microscope", color: "lime" },
        { name: "Microbiology", code: "MICRO", description: "Microbiology Department", icon: "fas fa-bacteria", color: "emerald" },
        
        // Engineering Departments
        { name: "Civil Engineering", code: "CIVIL", description: "Civil Engineering Department", icon: "fas fa-hard-hat", color: "brown" },
        { name: "Mechanical Engineering", code: "MECH", description: "Mechanical Engineering Department", icon: "fas fa-cogs", color: "gray" },
        { name: "Electrical Engineering", code: "EE", description: "Electrical Engineering Department", icon: "fas fa-bolt", color: "yellow" },
        { name: "Electronics & Communication", code: "ECE", description: "Electronics & Communication Engineering", icon: "fas fa-microchip", color: "indigo" },
        { name: "Chemical Engineering", code: "CHEM_ENG", description: "Chemical Engineering Department", icon: "fas fa-industry", color: "teal" },
        { name: "Aerospace Engineering", code: "AERO", description: "Aerospace Engineering Department", icon: "fas fa-plane", color: "sky" },
        
        // Liberal Arts & Humanities
        { name: "English Literature", code: "ENG", description: "English Literature Department", icon: "fas fa-book", color: "rose" },
        { name: "History", code: "HIST", description: "History Department", icon: "fas fa-landmark", color: "amber" },
        { name: "Philosophy", code: "PHIL", description: "Philosophy Department", icon: "fas fa-brain", color: "violet" },
        { name: "Psychology", code: "PSYCH", description: "Psychology Department", icon: "fas fa-head-side-virus", color: "pink" },
        { name: "Sociology", code: "SOC", description: "Sociology Department", icon: "fas fa-users", color: "slate" },
        
        // Arts & Design
        { name: "Fine Arts", code: "ARTS", description: "Fine Arts Department", icon: "fas fa-palette", color: "fuchsia" },
        { name: "Music", code: "MUSIC", description: "Music Department", icon: "fas fa-music", color: "purple" },
        { name: "Dance", code: "DANCE", description: "Dance Department", icon: "fas fa-running", color: "pink" },
        { name: "Theatre Arts", code: "THEATRE", description: "Theatre Arts Department", icon: "fas fa-masks", color: "red" },
        
        // Commerce & Management
        { name: "Commerce", code: "COMM", description: "Commerce Department", icon: "fas fa-chart-line", color: "green" },
        { name: "Business Administration", code: "BBA", description: "Business Administration Department", icon: "fas fa-briefcase", color: "blue" },
        { name: "Economics", code: "ECON", description: "Economics Department", icon: "fas fa-coins", color: "yellow" },
        { name: "Management Studies", code: "MGMT", description: "Management Studies Department", icon: "fas fa-tasks", color: "indigo" },
        
        // Language Departments
        { name: "Hindi", code: "HINDI", description: "Hindi Department", icon: "fas fa-language", color: "orange" },
        { name: "Sanskrit", code: "SANSKRIT", description: "Sanskrit Department", icon: "fas fa-om", color: "amber" },
        { name: "Regional Languages", code: "REGIONAL", description: "Regional Languages Department", icon: "fas fa-globe", color: "teal" },
        
        // Professional Courses
        { name: "Law", code: "LAW", description: "Law Department", icon: "fas fa-balance-scale", color: "gray" },
        { name: "Medicine", code: "MED", description: "Medicine Department", icon: "fas fa-user-md", color: "red" },
        { name: "Pharmacy", code: "PHARM", description: "Pharmacy Department", icon: "fas fa-pills", color: "green" },
        { name: "Nursing", code: "NURSING", description: "Nursing Department", icon: "fas fa-heartbeat", color: "pink" },
        { name: "Physiotherapy", code: "PHYSIO", description: "Physiotherapy Department", icon: "fas fa-walking", color: "blue" },
        
        // Specialized Departments
        { name: "Environmental Science", code: "ENV", description: "Environmental Science Department", icon: "fas fa-leaf", color: "green" },
        { name: "Food Technology", code: "FOOD", description: "Food Technology Department", icon: "fas fa-apple-alt", color: "red" },
        { name: "Agriculture", code: "AGRI", description: "Agriculture Department", icon: "fas fa-seedling", color: "green" },
        { name: "Forestry", code: "FOREST", description: "Forestry Department", icon: "fas fa-tree", color: "emerald" },
        { name: "Geology", code: "GEO", description: "Geology Department", icon: "fas fa-mountain", color: "brown" },
        { name: "Geography", code: "GEOG", description: "Geography Department", icon: "fas fa-map", color: "blue" },
        
        // General Facilities
        { name: "Library", code: "LIB", description: "Central Library", icon: "fas fa-book-open", color: "indigo" },
        { name: "Sports Complex", code: "SPORTS", description: "Sports & Physical Education", icon: "fas fa-dumbbell", color: "orange" },
        { name: "General Facilities", code: "GEN", description: "General University Facilities", icon: "fas fa-building", color: "slate" },
      ];

      // Create departments
      for (const dept of depts) {
        await this.createDepartment(dept);
      }

      // Get department IDs
      const cseDept = db.departments.find(d => d.code === "CSE")!;
      const itDept = db.departments.find(d => d.code === "IT")!;
      const chemDept = db.departments.find(d => d.code === "CHEM")!;
      const physDept = db.departments.find(d => d.code === "PHYS")!;
      const mathDept = db.departments.find(d => d.code === "MATH")!;
      const bioDept = db.departments.find(d => d.code === "BIO")!;
      const biotechDept = db.departments.find(d => d.code === "BIOTECH")!;
      const civilDept = db.departments.find(d => d.code === "CIVIL")!;
      const mechDept = db.departments.find(d => d.code === "MECH")!;
      const eeDept = db.departments.find(d => d.code === "EE")!;
      const eceDept = db.departments.find(d => d.code === "ECE")!;
      const artsDept = db.departments.find(d => d.code === "ARTS")!;
      const musicDept = db.departments.find(d => d.code === "MUSIC")!;
      const commDept = db.departments.find(d => d.code === "COMM")!;
      const bbaDept = db.departments.find(d => d.code === "BBA")!;
      const lawDept = db.departments.find(d => d.code === "LAW")!;
      const medDept = db.departments.find(d => d.code === "MED")!;
      const libDept = db.departments.find(d => d.code === "LIB")!;
      const sportsDept = db.departments.find(d => d.code === "SPORTS")!;
      const genDept = db.departments.find(d => d.code === "GEN")!;

      // Initialize comprehensive university resources
      const resources = [
        // Computer Science & Engineering
        {
          name: "Programming Lab 1",
          type: "computer_lab",
          departmentId: cseDept.id,
          capacity: 60,
          equipment: ["60 Workstations", "Projector", "Smart Board", "Network Infrastructure"],
          description: "Main programming lab with latest IDEs and compilers",
          location: "CSE Building, Room 101",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },
        {
          name: "Data Structures Lab",
          type: "computer_lab",
          departmentId: cseDept.id,
          capacity: 40,
          equipment: ["40 Workstations", "Interactive Whiteboard", "Server Rack"],
          description: "Specialized lab for data structures and algorithms",
          location: "CSE Building, Room 201",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },
        {
          name: "AI & Machine Learning Lab",
          type: "computer_lab",
          departmentId: cseDept.id,
          capacity: 30,
          equipment: ["High-Performance Workstations", "GPU Clusters", "Research Servers"],
          description: "Advanced lab for AI research and machine learning projects",
          location: "CSE Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Information Technology
        {
          name: "Network Lab",
          type: "computer_lab",
          departmentId: itDept.id,
          capacity: 35,
          equipment: ["Cisco Routers", "Switches", "Network Cables", "Testing Equipment"],
          description: "Network configuration and testing laboratory",
          location: "IT Building, Room 101",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Chemistry Labs
        {
          name: "Organic Chemistry Lab",
          type: "chemistry_lab",
          departmentId: chemDept.id,
          capacity: 30,
          equipment: ["Fume Hoods", "Lab Benches", "Safety Showers", "Chemical Storage"],
          description: "Organic synthesis and analysis laboratory",
          location: "Chemistry Building, Room 101",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },
        {
          name: "Analytical Chemistry Lab",
          type: "chemistry_lab",
          departmentId: chemDept.id,
          capacity: 25,
          equipment: ["HPLC", "GC-MS", "UV-Vis Spectrophotometer", "Balance Room"],
          description: "Advanced instrumentation for chemical analysis",
          location: "Chemistry Building, Room 201",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Physics Labs
        {
          name: "General Physics Lab",
          type: "physics_lab",
          departmentId: physDept.id,
          capacity: 40,
          equipment: ["Lab Benches", "Basic Equipment Sets", "Digital Multimeters"],
          description: "Introductory physics experiments laboratory",
          location: "Physics Building, Room 101",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },
        {
          name: "Optics & Photonics Lab",
          type: "physics_lab",
          departmentId: physDept.id,
          capacity: 20,
          equipment: ["Laser Systems", "Optical Benches", "Spectrometers", "Interferometers"],
          description: "Advanced optics research laboratory",
          location: "Physics Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Engineering Labs
        {
          name: "Fluid Mechanics Lab",
          type: "civil_lab",
          departmentId: civilDept.id,
          capacity: 25,
          equipment: ["Wind Tunnels", "Water Channels", "Flow Visualization Equipment"],
          description: "Fluid dynamics and hydraulics laboratory",
          location: "Civil Engineering Building, Room 101",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },
        {
          name: "Structural Engineering Lab",
          type: "civil_lab",
          departmentId: civilDept.id,
          capacity: 30,
          equipment: ["Universal Testing Machine", "Concrete Testing Equipment", "Steel Testing Apparatus"],
          description: "Materials testing and structural analysis lab",
          location: "Civil Engineering Building, Room 201",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Mechanical Engineering
        {
          name: "Manufacturing Lab",
          type: "mechanical_lab",
          departmentId: mechDept.id,
          capacity: 20,
          equipment: ["CNC Machines", "Lathes", "Milling Machines", "3D Printers"],
          description: "Advanced manufacturing and machining laboratory",
          location: "Mechanical Engineering Building, Room 101",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },
        {
          name: "Thermodynamics Lab",
          type: "mechanical_lab",
          departmentId: mechDept.id,
          capacity: 25,
          equipment: ["Heat Engines", "Refrigeration Systems", "Calorimeters", "Temperature Sensors"],
          description: "Heat transfer and thermodynamics experiments",
          location: "Mechanical Engineering Building, Room 201",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Electrical Engineering
        {
          name: "Power Systems Lab",
          type: "electrical_lab",
          departmentId: eeDept.id,
          capacity: 30,
          equipment: ["Power Analyzers", "Transformers", "Motors", "Control Panels"],
          description: "Electrical power systems and machinery lab",
          location: "Electrical Engineering Building, Room 101",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Electronics & Communication
        {
          name: "Communication Systems Lab",
          type: "electronics_lab",
          departmentId: eceDept.id,
          capacity: 35,
          equipment: ["Signal Generators", "Oscilloscopes", "Spectrum Analyzers", "Antennas"],
          description: "Digital and analog communication systems lab",
          location: "ECE Building, Room 101",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Biology & Biotechnology
        {
          name: "Molecular Biology Lab",
          type: "biology_lab",
          departmentId: biotechDept.id,
          capacity: 25,
          equipment: ["PCR Machines", "Gel Electrophoresis", "Centrifuges", "Incubators"],
          description: "DNA/RNA analysis and molecular cloning laboratory",
          location: "Biotechnology Building, Room 201",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Arts & Creative Spaces
        {
          name: "Art Studio",
          type: "art_studio",
          departmentId: artsDept.id,
          capacity: 30,
          equipment: ["Easels", "Painting Supplies", "Drawing Tables", "Printmaking Equipment"],
          description: "Studio space for painting, drawing, and printmaking",
          location: "Arts Building, Room 101",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },
        {
          name: "Music Practice Room",
          type: "music_room",
          departmentId: musicDept.id,
          capacity: 15,
          equipment: ["Pianos", "Guitars", "Drums", "Sound System", "Recording Equipment"],
          description: "Music practice and recording studio",
          location: "Arts Building, Room 301",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Business & Commerce
        {
          name: "Business Simulation Lab",
          type: "commerce_lab",
          departmentId: bbaDept.id,
          capacity: 40,
          equipment: ["Computers", "Business Software", "Market Simulators", "Presentation Equipment"],
          description: "Business simulation and case study laboratory",
          location: "Commerce Building, Room 101",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Medical Facilities
        {
          name: "Anatomy Lab",
          type: "medical_lab",
          departmentId: medDept.id,
          capacity: 50,
          equipment: ["Cadavers", "Anatomical Models", "Microscopes", "Dissection Tools"],
          description: "Human anatomy and dissection laboratory",
          location: "Medical Building, Room 101",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Law Facilities
        {
          name: "Moot Court",
          type: "moot_court",
          departmentId: lawDept.id,
          capacity: 100,
          equipment: ["Judge's Bench", "Lawyer Tables", "Public Gallery", "Audio System"],
          description: "Mock trial and legal practice courtroom",
          location: "Law Building, Room 201",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "15:00",
          hasWorkingHours: true,
        },

        // Library Facilities
        {
          name: "Central Library Reading Hall",
          type: "library",
          departmentId: libDept.id,
          capacity: 200,
          equipment: ["Reading Tables", "Computers", "WiFi", "Silent Study Areas"],
          description: "Main library reading and study hall",
          location: "Central Library, Ground Floor",
          requiresApproval: false,
          workingHoursStart: "08:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        {
          name: "Digital Library",
          type: "library",
          departmentId: libDept.id,
          capacity: 50,
          equipment: ["Computers", "Printers", "Scanners", "Digital Resources"],
          description: "Digital resources and computer access library",
          location: "Central Library, First Floor",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "17:00",
          hasWorkingHours: true,
        },

        // Sports Facilities
        {
          name: "Indoor Basketball Court",
          type: "sports_court",
          departmentId: sportsDept.id,
          capacity: 100,
          equipment: ["Professional Hoops", "Scoreboard", "Bleachers", "Sound System"],
          description: "Regulation basketball court for sports and events",
          location: "Sports Complex, Main Gym",
          requiresApproval: false,
          workingHoursStart: "06:00",
          workingHoursEnd: "22:00",
          hasWorkingHours: true,
        },
        {
          name: "Swimming Pool",
          type: "sports_facility",
          departmentId: sportsDept.id,
          capacity: 50,
          equipment: ["Olympic Size Pool", "Starting Blocks", "Lane Ropes", "Timing System"],
          description: "Olympic standard swimming pool",
          location: "Sports Complex, Aquatic Center",
          requiresApproval: false,
          workingHoursStart: "06:00",
          workingHoursEnd: "20:00",
          hasWorkingHours: true,
        },
        {
          name: "Outdoor Football Ground",
          type: "sports_ground",
          departmentId: sportsDept.id,
          capacity: 500,
          equipment: ["Goals", "Field Markings", "Floodlights", "Spectator Stands"],
          description: "Full-size football field with spectator facilities",
          location: "Sports Complex, Outdoor Fields",
          requiresApproval: false,
          workingHoursStart: "06:00",
          workingHoursEnd: "22:00",
          hasWorkingHours: true,
        },

        // General Facilities
        {
          name: "Main Auditorium",
          type: "auditorium",
          departmentId: genDept.id,
          capacity: 800,
          equipment: ["Professional Sound System", "Stage Lighting", "Projection System", "Recording Equipment"],
          description: "Main university auditorium for conferences and large events",
          location: "Main Building, Ground Floor",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "21:00",
          hasWorkingHours: true,
        },
        {
          name: "Seminar Hall A",
          type: "seminar_hall",
          departmentId: genDept.id,
          capacity: 100,
          equipment: ["Audio System", "Projector", "Smart Board", "Video Conferencing"],
          description: "Large seminar hall for departmental events",
          location: "Academic Block A, Room 101",
          requiresApproval: false,
          workingHoursStart: "09:00",
          workingHoursEnd: "17:00",
          hasWorkingHours: true,
        },
        {
          name: "Conference Room",
          type: "conference_room",
          departmentId: genDept.id,
          capacity: 25,
          equipment: ["Conference Table", "Video Conferencing", "Whiteboard", "Presentation Screen"],
          description: "Executive conference room for meetings",
          location: "Administration Building, Room 301",
          requiresApproval: true,
          workingHoursStart: "09:00",
          workingHoursEnd: "17:00",
          hasWorkingHours: true,
        },
      ];

      // Create resources
      for (const resource of resources) {
        await this.createResource(resource);
      }

      // Initialize sample user
      await this.createUser({
        username: "sarah.chen",
        email: "sarah.chen@university.edu",
        password: "hashedpassword",
        firstName: "Sarah",
        lastName: "Chen",
        role: "faculty",
        department: "Computer Science & Engineering",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      });

      console.log('✅ Sample data initialized successfully');
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return db.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.users.find(u => u.email === email);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: generateId(),
      username: userData.username!,
      email: userData.email!,
      password: userData.password!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      role: userData.role!,
      department: userData.department!,
      profileImage: userData.profileImage,
      createdAt: new Date(),
    };
    db.users.push(user);
    return user;
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return db.departments;
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return db.departments.find(d => d.id === id);
  }

  async createDepartment(deptData: Partial<Department>): Promise<Department> {
    const department: Department = {
      id: generateId(),
      name: deptData.name!,
      code: deptData.code!,
      description: deptData.description,
      icon: deptData.icon!,
      color: deptData.color!,
    };
    db.departments.push(department);
    return department;
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return db.resources.filter(r => r.isActive);
  }

  async getResource(id: string): Promise<Resource | undefined> {
    return db.resources.find(r => r.id === id);
  }

  async getResourcesByDepartment(departmentId: string): Promise<Resource[]> {
    return db.resources.filter(r => r.departmentId === departmentId && r.isActive);
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return db.resources.filter(r => r.type === type && r.isActive);
  }

  async createResource(resourceData: Partial<Resource>): Promise<Resource> {
    const resource: Resource = {
      id: generateId(),
      name: resourceData.name!,
      type: resourceData.type!,
      departmentId: resourceData.departmentId!,
      capacity: resourceData.capacity!,
      equipment: resourceData.equipment,
      description: resourceData.description,
      location: resourceData.location!,
      isActive: true,
      requiresApproval: resourceData.requiresApproval || false,
      workingHoursStart: resourceData.workingHoursStart || "09:00",
      workingHoursEnd: resourceData.workingHoursEnd || "15:00",
      hasWorkingHours: resourceData.hasWorkingHours ?? true,
      createdAt: new Date(),
    };
    db.resources.push(resource);
    return resource;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined> {
    const index = db.resources.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    db.resources[index] = { ...db.resources[index], ...updates };
    return db.resources[index];
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return db.bookings;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return db.bookings.find(b => b.id === id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return db.bookings.filter(b => b.userId === userId);
  }

  async getBookingsByResource(resourceId: string): Promise<Booking[]> {
    return db.bookings.filter(b => b.resourceId === resourceId);
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return db.bookings.filter(b => 
      b.startTime >= startDate && b.endTime <= endDate
    );
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const booking: Booking = {
      id: generateId(),
      resourceId: bookingData.resourceId!,
      userId: bookingData.userId!,
      startTime: bookingData.startTime!,
      endTime: bookingData.endTime!,
      status: 'pending',
      purpose: bookingData.purpose!,
      attendees: bookingData.attendees!,
      approvedBy: bookingData.approvedBy,
      approvedAt: bookingData.approvedAt,
      createdAt: new Date(),
    };
    db.bookings.push(booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = db.bookings.find(b => b.id === id);
    if (!booking) return undefined;
    
    booking.status = status;
    return booking;
  }

  async cancelBooking(id: string): Promise<boolean> {
    const booking = db.bookings.find(b => b.id === id);
    if (!booking) return false;
    
    booking.status = 'cancelled';
    return true;
  }

  // Utility methods
  async getResourceStatus(resourceId: string): Promise<string> {
    const now = new Date();
    const currentBookings = db.bookings.filter(b =>
      b.resourceId === resourceId &&
      b.status === 'confirmed' &&
      b.startTime <= now &&
      b.endTime >= now
    );

    if (currentBookings.length > 0) {
      return 'ongoing';
    }

    const futureBookings = db.bookings.filter(b =>
      b.resourceId === resourceId &&
      b.status === 'confirmed' &&
      b.startTime >= now
    );

    return futureBookings.length > 0 ? 'booked' : 'available';
  }

  async getConflictingBookings(resourceId: string, startTime: Date, endTime: Date): Promise<Booking[]> {
    return db.bookings.filter(b =>
      b.resourceId === resourceId &&
      b.status !== 'cancelled' &&
      (
        (b.startTime <= startTime && b.endTime >= startTime) ||
        (b.startTime <= endTime && b.endTime >= endTime) ||
        (b.startTime >= startTime && b.endTime <= endTime)
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

    const userBookings = db.bookings.filter(b =>
      b.userId === userId &&
      b.status !== 'cancelled' &&
      b.endTime >= now
    );

    return { available, booked, ongoing, myBookings: userBookings.length };
  }

  async isBookingTimeValid(resourceId: string, startTime: Date, endTime: Date): Promise<{ valid: boolean; message?: string }> {
    const resource = await this.getResource(resourceId);
    if (!resource) {
      return { valid: false, message: 'Resource not found' };
    }

    if (resource.hasWorkingHours) {
      // Extract time only for comparison using local time
      const startTimeOnly = startTime.getHours() * 60 + startTime.getMinutes();
      const endTimeOnly = endTime.getHours() * 60 + endTime.getMinutes();
      
      const [startHour, startMin] = resource.workingHoursStart.split(':').map(Number);
      const [endHour, endMin] = resource.workingHoursEnd.split(':').map(Number);
      
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
