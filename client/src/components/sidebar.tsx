import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Department } from "@shared/schema";
import type { NavItem } from "@/lib/types";
import { 
  University, 
  LayoutDashboard, 
  Calendar, 
  Search, 
  X, 
  Menu,
  Computer,
  FlaskConical,
  Atom,
  Dna,
  Calculator,
  Building,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const departmentIcons = {
  "fas fa-desktop": Computer,
  "fas fa-flask": FlaskConical,
  "fas fa-atom": Atom,
  "fas fa-dna": Dna,
  "fas fa-calculator": Calculator,
  "fas fa-building": Building,
};

const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/",
    isActive: true,
  },
  {
    id: "bookings",
    label: "My Bookings", 
    icon: "Calendar",
    path: "/my-bookings",
  },
  {
    id: "browse",
    label: "Browse Resources",
    icon: "Search",
    path: "/browse-resources",
  },
];

export function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 mobile-menu-overlay lg:hidden"
            onClick={onClose}
            data-testid="sidebar-overlay"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border sidebar-transition lg:translate-x-0"
        data-testid="sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <University className="text-sidebar-primary-foreground w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">UniResource</h1>
                <p className="text-sm text-muted-foreground">Resource Manager</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-sidebar-accent rounded-md transition-colors"
              data-testid="button-close-sidebar"
            >
              <X className="text-sidebar-foreground w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon === "LayoutDashboard" ? LayoutDashboard : 
                           item.icon === "Calendar" ? Calendar : Search;
                
                return (
                  <Link
                    key={item.id}
                    href={item.path || "#"}
                    onClick={() => {
                      setActiveItem(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </motion.button>
                  </Link>
                );
              })}
            </div>

            {/* Departments */}
            <div className="pt-6">
              <p className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Departments
              </p>
              <div className="space-y-1">
                {departments.map((dept) => {
                  const IconComponent = departmentIcons[dept.icon as keyof typeof departmentIcons] || Building;
                  
                  return (
                    <motion.button
                      key={dept.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
                      data-testid={`dept-${dept.code.toLowerCase()}`}
                    >
                      <IconComponent className={cn("w-4 h-4", {
                        "text-blue-500": dept.color === "blue",
                        "text-green-500": dept.color === "green",
                        "text-purple-500": dept.color === "purple",
                        "text-red-500": dept.color === "red",
                        "text-orange-500": dept.color === "orange",
                        "text-gray-500": dept.color === "gray",
                      })} />
                      <span>{dept.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-3 hover:bg-sidebar-accent rounded-lg transition-colors cursor-pointer"
              data-testid="user-profile"
            >
              <img
                src={currentUser?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                alt="User profile"
                className="w-10 h-10 rounded-full object-cover"
                data-testid="img-user-avatar"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-sidebar-foreground" data-testid="text-user-name">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Dr. Sarah Chen"}
                </p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
                  {currentUser ? `${currentUser.department} ${currentUser.role}` : "Computer Science Faculty"}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
