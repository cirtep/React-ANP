import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Package,
  BarChart4,
  ChevronDown,
} from "lucide-react";

const EnhancedSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState("");
  const location = useLocation();

  const isMobile = window.innerWidth < 768;

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: <Home size={18} />,
      path: "/",
      active: location.pathname === "/",
    },
    {
      id: "customer",
      label: "Customer",
      icon: <Users size={18} />,
      path: "/customer",
      active: location.pathname === "/customer",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <Package size={18} />,
      path: "/inventory",
      active: location.pathname === "/inventory",
    },
    {
      id: "forecast",
      label: "Sales Forecast",
      icon: <BarChart4 size={18} />,
      path: "/forecast",
      active:
        location.pathname.includes("/forecast") ||
        location.pathname.includes("/goals"),
      hasSubmenu: true,
      submenuItems: [
        { id: "forecast-main", label: "Forecast", path: "/forecast" },
        { id: "goals", label: "Goals", path: "/goals" },
      ],
    },
  ];

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
      if (!isCollapsed) {
        setExpandedSubmenu("");
      }
    }
  };

  const toggleSubmenu = (id) => {
    setExpandedSubmenu(expandedSubmenu === id ? "" : id);
  };

  const sidebarWidth = isMobile ? "w-64" : isCollapsed ? "w-16" : "w-56";

  return (
    <div
      className={`bg-[#1e2233] text-white flex flex-col ${sidebarWidth} transition-all duration-300 h-full`}
    >
      {/* Logo section */}
      <div className="p-4 h-16 flex items-center border-b border-gray-700">
        {(!isCollapsed || isMobile) && (
          <h1 className="text-lg font-semibold whitespace-nowrap">
            Aneka Niaga Pratama
          </h1>
        )}
        {isCollapsed && !isMobile && (
          <span className="text-lg font-bold mx-auto">ANP</span>
        )}
      </div>

      {/* Navigation items - with custom scrollbar */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-container">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`flex items-center w-full px-2 py-3 rounded-md ${
                      item.active ? "bg-blue-500" : "hover:bg-gray-700"
                    } transition-colors duration-200`}
                  >
                    <div className="min-w-8 h-8 flex items-center justify-center bg-gray-700 rounded-md mr-3">
                      {item.icon}
                    </div>
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            expandedSubmenu === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {(!isCollapsed || isMobile) &&
                    expandedSubmenu === item.id && (
                      <div className="pl-12 space-y-1 mt-1">
                        {item.submenuItems.map((subItem) => (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            className={`block px-2 py-2 text-sm rounded-md hover:bg-gray-700 ${
                              location.pathname === subItem.path
                                ? "bg-gray-700 text-white"
                                : "text-gray-300"
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-2 py-3 rounded-md ${
                    item.active ? "bg-blue-500" : "hover:bg-gray-700"
                  } transition-colors duration-200`}
                >
                  <div className="min-w-8 h-8 flex items-center justify-center bg-gray-700 rounded-md mr-3">
                    {item.icon}
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <span className="flex-1">{item.label}</span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Collapse button - only show on desktop */}
      {!isMobile && (
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedSidebar;
