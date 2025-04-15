// ui/src/components/GlobalLayout.tsx
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LayoutDashboard, // Changed from Home
  Building2,
  Users, // For Contacts
  DollarSign, // For Sales
  Filter, // For Leads
  CheckSquare, // For Tasks
  GitBranch, // For Pipelines
  BookOpen, // For Bookkeeping
  SlidersHorizontal, // For Control Center
  UsersRound, // For User Management
  CalendarDays, // For Calendar
} from "lucide-react"; // Import necessary icons

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void; // For closing sheet on mobile
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
  >
    {icon}
    <span className="ml-3">{label}</span>
  </Link>
);

export const GlobalLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Updated navigation items for the CRM
  const navItems = [
    { to: "/", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { to: "/Companies", icon: <Building2 className="w-5 h-5" />, label: "Companies" },
    { to: "/Contacts", icon: <Users className="w-5 h-5" />, label: "Contacts" },
    { to: "/Sales", icon: <DollarSign className="w-5 h-5" />, label: "Sales" },
    { to: "/Leads", icon: <Filter className="w-5 h-5" />, label: "Leads" },
    { to: "/Tasks", icon: <CheckSquare className="w-5 h-5" />, label: "Tasks" },
    { to: "/Pipelines", icon: <GitBranch className="w-5 h-5" />, label: "Pipelines" },
    { to: "/Bookkeeping", icon: <BookOpen className="w-5 h-5" />, label: "Bookkeeping" },
    { to: "/ControlCenter", icon: <SlidersHorizontal className="w-5 h-5" />, label: "Control Center" },
    { to: "/UserManagement", icon: <UsersRound className="w-5 h-5" />, label: "User Management" },
    { to: "/Calendar", icon: <CalendarDays className="w-5 h-5" />, label: "Calendar" },
  ];

  // TODO: Get logo URL from stored static assets if available
  const logoUrl = "https://static.databutton.com/public/0f5df23f-7647-44ce-858d-68204b6c131e/db-logo-512.png"; // Replace with your actual logo asset ID if uploaded

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 md:block">
        <div className="px-6 py-4 flex items-center space-x-2">
           {logoUrl && <img src={logoUrl} alt="CompanyPulse Logo" className="h-8 w-auto" />} {/* Display logo */}
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            CompanyPulse
          </h2>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>
        {/* Add User Account / Settings links here later */}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar for Mobile */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 md:hidden">
           {/* Mobile Logo and Title */}
           <div className="flex items-center space-x-2">
            {logoUrl && <img src={logoUrl} alt="CompanyPulse Logo" className="h-8 w-auto" />}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              CompanyPulse
            </h2>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              {/* Mobile Menu Logo */} 
              <div className="px-2 py-2 mb-4 flex items-center space-x-2">
                 {logoUrl && <img src={logoUrl} alt="CompanyPulse Logo" className="h-8 w-auto" />}
                 <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    CompanyPulse
                 </h2>
              </div>
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    {...item}
                    onClick={closeMobileMenu} // Close sheet on click
                  />
                ))}
                {/* Add User Account / Settings links here later */}
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
          {/* Outlet renders the current route's component */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

