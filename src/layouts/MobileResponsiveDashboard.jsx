import React, { useState } from "react";
import EnhancedSidebar from "../components/EnhancedSidebar";
import Header from "../components/Header";
import { Menu, X } from "lucide-react";

const MobileResponsiveDashboard = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-30 w-64 bg-[#1e2233] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button - moved and repositioned */}
        <div className="absolute top-3 right-3 lg:hidden">
          <button
            className="flex items-center justify-center h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-white bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <EnhancedSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title}>
          <button
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </Header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MobileResponsiveDashboard;
