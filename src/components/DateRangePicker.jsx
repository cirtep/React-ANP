// src/components/DateRangePicker.jsx
import React, { useState, useEffect } from "react";
import { Calendar, X, Filter, RotateCcw } from "lucide-react";

const DateRangePicker = ({
  onDateChange,
  initialStartDate = null,
  initialEndDate = null,
  className = "",
  disabled = false,
}) => {
  const [startDate, setStartDate] = useState(initialStartDate || "");
  const [endDate, setEndDate] = useState(initialEndDate || "");
  const [isOpen, setIsOpen] = useState(false);
  const [quickRanges] = useState([
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 3 months", days: 90 },
    { label: "Last 6 months", days: 180 },
    { label: "Last 12 months", days: 365 },
    { label: "Year to Date", isYTD: true },
  ]);

  // Calculate date from days ago
  const getDateFromDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };

  // Get year to date
  const getYearToDate = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return {
      start: startOfYear.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    };
  };

  // Handle quick range selection
  const handleQuickRange = (range) => {
    let newStartDate, newEndDate;

    if (range.isYTD) {
      const ytd = getYearToDate();
      newStartDate = ytd.start;
      newEndDate = ytd.end;
    } else {
      newStartDate = getDateFromDaysAgo(range.days);
      newEndDate = new Date().toISOString().split("T")[0];
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);

    // Call parent callback
    if (onDateChange) {
      onDateChange({
        startDate: newStartDate,
        endDate: newEndDate,
      });
    }

    setIsOpen(false);
  };

  // Handle manual date input
  const handleDateInputChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  // Handle apply button
  const handleApply = () => {
    if (startDate && endDate) {
      // Validate date range
      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date");
        return;
      }

      // Check if range is not too large (max 2 years)
      const daysDiff =
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
      if (daysDiff > 730) {
        alert("Date range too large. Maximum 2 years allowed.");
        return;
      }

      if (onDateChange) {
        onDateChange({
          startDate,
          endDate,
        });
      }
      setIsOpen(false);
    } else {
      alert("Please select both start and end dates");
    }
  };

  // Handle clear/reset
  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    if (onDateChange) {
      onDateChange({
        startDate: null,
        endDate: null,
      });
    }
    setIsOpen(false);
  };

  // Format display text
  const getDisplayText = () => {
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const end = new Date(endDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return `${start} - ${end}`;
    }
    return "Select date range";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".date-range-picker")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative date-range-picker ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg
          bg-white text-sm min-w-[200px] transition-colors
          ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }
          ${startDate && endDate ? "text-gray-900" : "text-gray-500"}
        `}
      >
        <div className="flex items-center">
          <Calendar size={16} className="mr-2 text-gray-400" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <Filter size={14} className="ml-2 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[350px]">
          <div className="p-4 space-y-4">
            {/* Quick Ranges */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Quick Select
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickRange(range)}
                    className="px-3 py-2 text-sm text-left border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Date Selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Custom Range
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      handleDateInputChange("start", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    max={endDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      handleDateInputChange("end", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    min={startDate}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <button
                onClick={handleClear}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw size={14} className="mr-1" />
                Clear
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
