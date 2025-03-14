import React from "react";

const GoalsPage = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Sales Goals</h1>
      <p className="text-gray-600">
        Sales goals and targets will be displayed here.
      </p>

      {/* Placeholder for goals content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex items-center justify-center">
          Monthly Goal
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex items-center justify-center">
          Quarterly Goal
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex items-center justify-center">
          Annual Goal
        </div>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
        Goal Progress Chart Placeholder
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 h-48 flex items-center justify-center">
        Team Performance Table Placeholder
      </div>
    </div>
  );
};

export default GoalsPage;
