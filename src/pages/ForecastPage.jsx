import React from "react";

const ForecastPage = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Sales Forecast
      </h1>
      <p className="text-gray-600">
        Sales forecast data and analytics will be displayed here.
      </p>

      {/* Placeholder for forecast content */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
        Sales Forecast Chart Placeholder
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-48 flex items-center justify-center">
          Monthly Trend
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-48 flex items-center justify-center">
          Annual Projection
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
