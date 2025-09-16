# Resource Booking Management System

## Overview

This is a university resource booking management system built as a full-stack web application. The system allows students and faculty to browse, book, and manage university resources like computer labs, chemistry labs, auditoriums, and other facilities. It features a modern React frontend with a Node.js/Express backend and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and better development experience
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management, caching, and API interactions
- **shadcn/ui** component library with Radix UI primitives for consistent, accessible UI components
- **Tailwind CSS** for utility-first styling with CSS variables for theming
- **Framer Motion** for smooth animations and transitions
- **React Hook Form** with Zod validation for form handling and validation

The frontend follows a component-based architecture with:
- Reusable UI components in `client/src/components/ui/`
- Feature-specific components for booking slots, resource cards, and forms
- Custom hooks for mobile detection and toast notifications
- Centralized theme management with dark/light mode support

### Backend Architecture
- **Express.js** server with TypeScript for the REST API
- **In-memory storage** as the data layer (likely for development/demo purposes)
- Modular route organization with separate route handlers
- Custom middleware for request logging and error handling
- Development-optimized Vite integration for hot module replacement

The backend implements:
- RESTful API endpoints for resources, bookings, departments, and authentication
- Storage abstraction layer with interfaces for data operations
- Dashboard analytics and booking management functionality

### Database Design
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **Neon Database** serverless PostgreSQL for cloud deployment
- Schema-driven approach with TypeScript types generated from database schema

Key entities:
- **Users**: Students and faculty with role-based access
- **Departments**: Academic departments with associated resources
- **Resources**: Bookable facilities with capacity, equipment, and availability
- **Bookings**: Reservation records with status tracking and approval workflows

### State Management
- **TanStack Query** handles server state with automatic caching and background updates
- **React Context** for theme management
- Local component state for UI interactions and form handling

### Authentication & Authorization
- Simplified authentication system (likely for demo purposes)
- User session management with role-based access (student/faculty)
- Department-based resource access control

### UI/UX Design System
- **Design tokens** implemented via CSS custom properties
- **Component variants** using class-variance-authority for consistent styling
- **Responsive design** with mobile-first approach
- **Accessibility** built-in through Radix UI primitives
- **Animation system** using Framer Motion for enhanced user experience

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for database connectivity
- **drizzle-orm & drizzle-kit**: Type-safe ORM with schema migrations
- **express**: Web server framework for REST API
- **tsx**: TypeScript execution for development server

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing for single-page application
- **@hookform/resolvers**: Form validation integration
- **framer-motion**: Animation and gesture library
- **date-fns**: Date manipulation and formatting

### UI Component System
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Database & Validation
- **zod**: Schema validation for forms and API
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation
- **connect-pg-simple**: PostgreSQL session store (though sessions appear simplified)

The system is designed as a modern, type-safe full-stack application with a focus on developer experience and user interface polish, suitable for a university resource management use case.