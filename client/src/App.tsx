import { Switch, Route } from "wouter";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider, useTheme } from "./components/theme-provider";
import { Sidebar } from "./components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dashboard from "@/pages/dashboard";
import MyBookings from "@/pages/my-bookings";
import BrowseResources from "@/pages/browse-resources";
import NotFound from "@/pages/not-found";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
            data-testid="button-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Resource Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage and book university resources</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Input
              type="text"
              placeholder="Search resources..."
              className="w-64 pl-10"
              data-testid="input-global-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </Button>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === "dark" ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.div>
          </Button>
        </div>
      </div>
    </header>
  );
}

function MainContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="lg:ml-72 min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/my-bookings" component={MyBookings} />
              <Route path="/browse-resources" component={BrowseResources} />
              <Route component={NotFound} />
            </Switch>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="uni-resource-theme">
        <TooltipProvider>
          <MainContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
