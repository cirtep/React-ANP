import React from "react";

const InventoryPage = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Inventory Management
      </h1>
      <p className="text-gray-600">
        Inventory data and stock management will be displayed here.
      </p>

      {/* Placeholder for inventory content */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
        Inventory Table Placeholder
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex items-center justify-center">
          Total Items
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex items-center justify-center">
          Low Stock Alert
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex items-center justify-center">
          Recent Activities
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
