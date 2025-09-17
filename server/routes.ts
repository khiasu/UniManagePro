import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertResourceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints (simplified for demo)
  app.get("/api/auth/me", async (req, res) => {
    try {
      // For demo purposes, return the sample user
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

  // Department endpoints
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // Resource endpoints
  app.get("/api/resources", async (req, res) => {
    try {
      const { department, type } = req.query;
      
      let resources;
      if (department) {
        resources = await storage.getResourcesByDepartment(department as string);
      } else if (type) {
        resources = await storage.getResourcesByType(type as string);
      } else {
        resources = await storage.getAllResources();
      }

      // Enrich with department info and status
      const departments = await storage.getAllDepartments();
      const enrichedResources = await Promise.all(
        resources.map(async (resource) => {
          const dept = departments.find(d => d.id === resource.departmentId);
          const status = await storage.getResourceStatus(resource.id);
          return {
            ...resource,
            department: dept,
            status,
            workingHoursStart: resource.workingHoursStart,
            workingHoursEnd: resource.workingHoursEnd,
            hasWorkingHours: resource.hasWorkingHours,
          };
        })
      );

      res.json(enrichedResources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResource(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const department = await storage.getDepartment(resource.departmentId);
      const status = await storage.getResourceStatus(resource.id);
      
      res.json({
        ...resource,
        department,
        status,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  // Booking endpoints
  app.get("/api/bookings", async (req, res) => {
    try {
      const { user, resource, date } = req.query;
      
      let bookings;
      if (user) {
        bookings = await storage.getBookingsByUser(user as string);
      } else if (resource) {
        bookings = await storage.getBookingsByResource(resource as string);
      } else if (date) {
        const startDate = new Date(date as string);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        bookings = await storage.getBookingsByDateRange(startDate, endDate);
      } else {
        bookings = await storage.getAllBookings();
      }

      // Enrich with resource and user info
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

  app.post("/api/bookings", async (req, res) => {
    try {
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
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const success = await storage.cancelBooking(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // For demo, use sample user
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

  // Resource availability check
  app.get("/api/resources/:id/availability", async (req, res) => {
    try {
      const { date } = req.query;
      const resourceId = req.params.id;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      const bookings = await storage.getBookingsByResource(resourceId);
      const dayBookings = bookings.filter(b => 
        b.startTime >= startDate && 
        b.startTime < endDate &&
        b.status !== 'cancelled'
      );

      res.json(dayBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
