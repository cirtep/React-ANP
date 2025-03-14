import React from "react";

const CustomerPage = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Customer Management
      </h1>
      <p className="text-gray-600">
        Customer data and management will be displayed here.
      </p>

      {/* Placeholder for customer content */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
        Customer Table Placeholder
      </div>
    </div>
  );
};

export default CustomerPage;
