import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Settings, LogOut, Menu } from "lucide-react";
import useAuth from "../hooks/useAuth";

const Header = ({ title = "Title", children }) => {
  const { logout, currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-10 shadow-sm">
      <div className="flex items-center">
        {children}
        <h2 className="text-xl font-medium text-gray-800 ml-2">{title}</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center ml-4 cursor-pointer"
            onClick={toggleDropdown}
          >
            <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center text-white mr-2">
              🤑
            </div>
            <span className="hidden md:block">
              {currentUser?.full_name || "Burger"}
            </span>
            <ChevronDown
              size={16}
              className={`ml-1 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <Link
                to="/settings"
                state={{ from: location.pathname }} // Kirim state from
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left cursor-pointer"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
