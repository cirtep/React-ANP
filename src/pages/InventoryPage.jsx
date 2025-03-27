import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  PlusCircle,
  Download,
  AlertTriangle,
  Box,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const InventoryPage = () => {
  // State management
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // const [selectedProducts, setSelectedProducts] = useState([]);

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    criticalStockItems: 0,
  });

  // Pagination
  const itemsPerPage = 10;

  // Fetch inventory data
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/inventory/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to fetch inventory");
      }

      // Directly use the data and metrics from the response
      setInventory(responseData.data);

      // Set metrics from the server-side calculation
      setMetrics({
        totalItems: responseData.metrics.total_items,
        totalValue: responseData.metrics.total_value,
        lowStockItems: responseData.metrics.low_stock_items,
        criticalStockItems: responseData.metrics.critical_stock_items,
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filtering and Search
  const filteredInventory = useMemo(() => {
    return inventory.filter((product) =>
      Object.values(product).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [inventory, searchTerm]);

  // Pagination
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage]);

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p>Error: {error}</p>
        <button
          onClick={fetchInventoryData}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Inventory Management
        </h1>
        <div className="flex items-center space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600 transition"
            title="Add New Product"
          >
            <PlusCircle className="mr-2" size={20} /> Add Product
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600 transition"
            title="Export Inventory"
          >
            <Download className="mr-2" size={20} /> Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
          <Box className="mr-4 text-blue-600" size={32} />
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-blue-800">
              {metrics.totalItems}
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="mr-4 text-yellow-600" size={32} />
          <div>
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-800">
              {metrics.lowStockItems}
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <TrendingDown className="mr-4 text-red-600" size={32} />
          <div>
            <p className="text-sm text-gray-600">Critical Stock</p>
            <p className="text-2xl font-bold text-red-800">
              {metrics.criticalStockItems}
            </p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <TrendingUp className="mr-4 text-green-600" size={32} />
          <div>
            <p className="text-sm text-gray-600">Total Inventory Value</p>
            <p className="text-2xl font-bold text-green-800">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(metrics.totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between mb-4">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
        <button
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded flex items-center hover:bg-gray-200 transition"
          title="Advanced Filters"
        >
          <Filter className="mr-2" size={20} /> Filters
        </button>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Product Code</th>
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map((product) => (
              <tr
                key={product.product_id}
                className={`border-b hover:bg-gray-50 transition ${
                  product.qty <= product.min_stock
                    ? "bg-yellow-50 hover:bg-yellow-100"
                    : ""
                }`}
              >
                <td className="p-3">{product.product_code}</td>
                <td className="p-3">{product.product_name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">
                  <span
                    className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${
                      product.qty <= product.min_stock
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  `}
                  >
                    {product.qty} {product.unit}
                  </span>
                </td>
                <td className="p-3">{product.location}</td>
                <td className="p-3">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(product.standard_price)}
                </td>
                <td className="p-3">
                  <span
                    className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${
                      product.qty <= product.min_stock
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  `}
                  >
                    {product.qty <= product.min_stock
                      ? "Low Stock"
                      : "In Stock"}
                  </span>
                </td>
                <td className="p-3 flex space-x-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Product"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of{" "}
          {filteredInventory.length} products
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev * itemsPerPage < filteredInventory.length ? prev + 1 : prev
              )
            }
            disabled={currentPage * itemsPerPage >= filteredInventory.length}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
