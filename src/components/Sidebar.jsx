import React, { useState, useEffect } from "react";
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

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(
    location.pathname.startsWith("/customer/")
  );
  const [expandedSubmenu, setExpandedSubmenu] = useState("");

  useEffect(() => {
    if (location.pathname.startsWith("/customer/")) {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: <Home size={16} />,
      path: "/",
      active: location.pathname === "/",
    },
    {
      id: "customer",
      label: "Customer",
      icon: <Users size={16} />,
      path: "/customer",
      active:
        location.pathname === "/customer" ||
        location.pathname.startsWith("/customer/"),
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <Package size={16} />,
      path: "/inventory",
      active:
        location.pathname === "/inventory" ||
        location.pathname.startsWith("/inventory/"),
    },
    {
      id: "forecast",
      label: "Sales Forecast",
      icon: <BarChart4 size={16} />,
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
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedSubmenu("");
    }
  };

  const toggleSubmenu = (id) => {
    if (isCollapsed) {
      // If sidebar is collapsed, expand it first
      setIsCollapsed(false);
      setTimeout(() => {
        setExpandedSubmenu(id);
      }, 50);
    } else {
      setExpandedSubmenu(expandedSubmenu === id ? "" : id);
    }
  };

  return (
    <div
      className={`bg-[#1e2233] text-white flex flex-col ${
        isCollapsed ? "w-12" : "w-52"
      } transition-all duration-300 h-screen`}
    >
      {/* Logo section */}
      <div className="py-4 px-2 h-16 flex items-center justify-center border-b border-gray-700">
        {!isCollapsed && (
          <h1 className="text-base font-semibold whitespace-nowrap">
            Aneka Niaga Pratama
          </h1>
        )}
        {isCollapsed && <span className="text-base font-bold">ANP</span>}
      </div>

      {/* Navigation items with custom scrollbar */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-container">
        <nav className="space-y-1 px-1">
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`flex items-center w-full rounded-md cursor-pointer ${
                      isCollapsed ? "justify-center py-3 px-2" : "px-3 py-2"
                    } ${
                      item.active ? "bg-blue-500" : "hover:bg-gray-700"
                    } transition-colors duration-200 text-sm`}
                  >
                    <div
                      className={`flex items-center justify-center rounded-md ${
                        isCollapsed ? "mx-0" : "mr-2"
                      } opacity-90`}
                    >
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            expandedSubmenu === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {!isCollapsed && expandedSubmenu === item.id && (
                    <div className="pl-10 space-y-1 mt-1 mb-1">
                      {item.submenuItems.map((subItem) => (
                        <Link
                          key={subItem.id}
                          to={subItem.path}
                          className={`block px-2 py-1.5 text-xs rounded-md hover:bg-gray-700 ${
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
                  className={`flex items-center rounded-md ${
                    isCollapsed ? "justify-center py-3 px-2" : "px-3 py-2"
                  } ${
                    item.active ? "bg-blue-500" : "hover:bg-gray-700"
                  } transition-colors duration-200 text-sm`}
                >
                  <div
                    className={`flex items-center justify-center rounded-md ${
                      isCollapsed ? "mx-0" : "mr-2"
                    } opacity-90`}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && <span className="flex-1">{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Collapse button */}
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
