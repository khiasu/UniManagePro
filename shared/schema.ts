import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // 'student' or 'faculty'
  department: text("department").notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'computer_lab', 'chemistry_lab', 'auditorium', 'engineering_lab', 'art_studio', 'music_room', 'commerce_lab', 'sports_court', 'sports_ground', etc.
  departmentId: varchar("department_id").references(() => departments.id).notNull(),
  capacity: integer("capacity").notNull(),
  equipment: text("equipment").array(), // JSON array of equipment
  description: text("description"),
  location: text("location").notNull(),
  isActive: boolean("is_active").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  workingHoursStart: text("working_hours_start").default("09:00"), // Start time (24-hour format)
  workingHoursEnd: text("working_hours_end").default("15:00"), // End time (24-hour format)
  hasWorkingHours: boolean("has_working_hours").default(true), // False for courts/grounds that are always available
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourceId: varchar("resource_id").references(() => resources.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull(), // 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'
  purpose: text("purpose").notNull(),
  attendees: integer("attendees").notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  department: true,
  profileImage: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  code: true,
  description: true,
  icon: true,
  color: true,
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  name: true,
  type: true,
  departmentId: true,
  capacity: true,
  equipment: true,
  description: true,
  location: true,
  requiresApproval: true,
  workingHoursStart: true,
  workingHoursEnd: true,
  hasWorkingHours: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  resourceId: true,
  userId: true,
  startTime: true,
  endTime: true,
  purpose: true,
  attendees: true,
}).extend({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Status types
export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
export type ResourceStatus = 'available' | 'booked' | 'ongoing' | 'maintenance';
export type UserRole = 'student' | 'faculty';
