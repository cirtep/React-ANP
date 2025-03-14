import React from "react";

const HomePage = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Home Dashboard
      </h1>
      <p className="text-gray-600">
        Welcome to the Aneka Niaga Pratama dashboard. This is the home page
        content area.
      </p>

      {/* Placeholder for dashboard content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-40 flex items-center justify-center">
          Dashboard Widget Placeholder
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-40 flex items-center justify-center">
          Dashboard Widget Placeholder
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-40 flex items-center justify-center">
          Dashboard Widget Placeholder
        </div>
      </div>
    </div>
  );
};

export default HomePage;
