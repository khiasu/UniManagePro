# UniManagePro

A comprehensive university resource management system built with modern web technologies.

## 🎯 Features

### 📚 Department Management
- **Arts Department** - Art Studio and Music Room facilities
- **Commerce Department** - Commerce Lab with business tools
- **Engineering Departments**:
  - B.Tech CSE - Computer Labs 3 & 4
  - B.Tech Civil - Civil Engineering Lab
  - B.Tech Mechanical - Mechanical Workshop
  - B.Tech Electrical - Electrical Lab

### 🏢 Facilities & Resources
- **4 Computer Labs** (2 existing + 2 new for Engineering CSE)
- **Specialized Engineering Labs** with equipment for each branch
- **Sports Facilities**:
  - Volleyball Court
  - General Ground (multi-purpose outdoor sports)
- **Academic Spaces**:
  - Auditoriums and Seminar Halls
  - Chemistry and Physics Labs

### ⏰ Smart Scheduling
- **Working Hours**: 9:00 AM - 3:00 PM for labs, classrooms, and indoor facilities
- **24/7 Access**: Sports courts and grounds available round the clock
- **Automatic Validation**: Booking system enforces working hours
- **Real-time Availability**: Live status updates for all resources

### 🔧 Technical Features
- **Modern UI/UX**: Built with React, TailwindCSS, and Radix UI
- **Type Safety**: Full TypeScript implementation
- **Real-time Updates**: Live booking status and availability
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching support

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database operations
- **Zod** - Schema validation

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - Fast JavaScript bundler
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/khiasu/UniManagePro.git
   cd UniManagePro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🏗️ Project Structure

```
UniManagePro/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and types
│   │   └── hooks/         # Custom React hooks
│   └── index.html         # HTML entry point
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── package.json          # Project dependencies
```

## 🎨 UI Components

The project uses a comprehensive set of UI components built on Radix UI:

- **Forms**: Input, Select, Checkbox, Radio Group
- **Navigation**: Sidebar, Breadcrumb, Pagination
- **Feedback**: Toast, Alert, Progress
- **Overlays**: Dialog, Popover, Tooltip
- **Data Display**: Card, Table, Badge
- **Layout**: Separator, Scroll Area, Resizable

## 🔐 Authentication

Currently implements a simplified authentication system for demonstration purposes. In production, integrate with your preferred authentication provider.

## 📊 Database Schema

The system uses the following main entities:

- **Users** - Student and faculty information
- **Departments** - Academic and administrative departments
- **Resources** - Bookable facilities and equipment
- **Bookings** - Resource reservation records

## 🌟 Key Features in Detail

### Resource Booking System
- **Real-time Availability**: Check resource status instantly
- **Conflict Detection**: Prevents double-booking automatically
- **Working Hours Validation**: Ensures bookings within operational hours
- **Approval Workflow**: Some resources require faculty approval

### Dashboard Analytics
- **Resource Statistics**: Available, booked, and ongoing resources
- **Personal Bookings**: Track your reservation history
- **Quick Actions**: Fast access to common tasks
- **Visual Indicators**: Color-coded status system

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Easy navigation on mobile devices
- **Progressive Enhancement**: Works without JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- UI components from Radix UI
- Icons from Lucide React
- Fonts from Google Fonts

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**UniManagePro** - Making university resource management simple and efficient! 🎓
