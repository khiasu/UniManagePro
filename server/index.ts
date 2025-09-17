import express from "express";
import { storage } from "./storage";
import { insertBookingSchema } from "../shared/schema";
import path from "path";

const app = express();
app.use(express.json());

console.log("Starting UniManagePro server...");

// API Routes
app.get("/api/departments", async (req, res) => {
  try {
    const departments = await storage.getAllDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

app.get("/api/resources", async (req, res) => {
  try {
    const resources = await storage.getAllResources();
    const departments = await storage.getAllDepartments();
    
    const enrichedResources = await Promise.all(
      resources.map(async (resource) => {
        const dept = departments.find(d => d.id === resource.departmentId);
        const status = await storage.getResourceStatus(resource.id);
        return {
          ...resource,
          department: dept,
          status,
        };
      })
    );
    
    res.json(enrichedResources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const user = await storage.getUserByUsername("sarah.chen");
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to authenticate" });
  }
});

// Booking routes
app.post("/api/bookings", async (req, res) => {
  try {
    console.log("Booking request received:", req.body);
    const validatedData = insertBookingSchema.parse(req.body);
    
    // Check working hours validation
    const timeValidation = await storage.isBookingTimeValid(
      validatedData.resourceId,
      validatedData.startTime,
      validatedData.endTime
    );

    if (!timeValidation.valid) {
      return res.status(400).json({ 
        message: timeValidation.message 
      });
    }
    
    // Check for conflicts
    const conflicts = await storage.getConflictingBookings(
      validatedData.resourceId,
      validatedData.startTime,
      validatedData.endTime
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: "Time slot conflicts with existing booking",
        conflicts 
      });
    }

    const booking = await storage.createBooking(validatedData);
    res.status(201).json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    if (error.name === 'ZodError') {
      res.status(400).json({ message: "Invalid booking data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create booking" });
    }
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const { user, resource } = req.query;
    
    let bookings;
    if (user) {
      bookings = await storage.getBookingsByUser(user as string);
    } else if (resource) {
      bookings = await storage.getBookingsByResource(resource as string);
    } else {
      bookings = await storage.getAllBookings();
    }

    // Enrich with resource info
    const resources = await storage.getAllResources();
    const enrichedBookings = bookings.map(booking => {
      const resource = resources.find(r => r.id === booking.resourceId);
      return {
        ...booking,
        resource,
      };
    });

    res.json(enrichedBookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const user = await storage.getUserByUsername("sarah.chen");
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const stats = await storage.getDashboardStats(user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// Serve static files
app.use(express.static(process.cwd()));

// Simple test route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>UniManagePro Server</title></head>
      <body>
        <h1>UniManagePro Server is Running!</h1>
        <p>Server is working correctly.</p>
        <ul>
          <li><a href="/test.html">Full Test Page</a></li>
          <li><a href="/simple-test.html">Simple Test Page</a></li>
          <li><a href="/api/departments">Departments API</a></li>
          <li><a href="/api/resources">Resources API</a></li>
          <li><a href="/api/auth/me">Auth API</a></li>
        </ul>
        <h2>Frontend App</h2>
        <p><a href="http://localhost:3000">React App (Port 3000)</a></p>
      </body>
    </html>
  `);
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:5000`);
  console.log("Available endpoints:");
  console.log("- http://localhost:5000/ (Server status)");
  console.log("- http://localhost:5000/test.html (Full test)");
  console.log("- http://localhost:5000/simple-test.html (Simple test)");
  console.log("- http://localhost:5000/api/departments (API)");
  console.log("- Frontend: http://localhost:3000");
});
