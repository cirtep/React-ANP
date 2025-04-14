import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  PlusCircle,
  Download,
  AlertTriangle,
  Box,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  RefreshCw,
  Loader,
} from "lucide-react";

const InventoryPage = () => {
  // State management
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    criticalStockItems: 0,
  });

  const navigate = useNavigate();

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

      setInventory(responseData.data);
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

  // Navigate to product detail
  const handleProductClick = (productId) => {
    navigate(`/inventory/${productId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-[500px]">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
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
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track stock levels and manage your products
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600 transition"
            title="Add New Product"
          >
            <PlusCircle className="mr-2" size={18} /> Add Product
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded flex items-center hover:bg-gray-200 transition"
            title="Export Inventory"
          >
            <Download className="mr-2" size={18} /> Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md">
          <Box className="mr-4 text-blue-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-blue-800">
              {metrics.totalItems}
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md">
          <AlertTriangle className="mr-4 text-yellow-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-800">
              {metrics.lowStockItems}
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md">
          <TrendingDown className="mr-4 text-red-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Critical Stock</p>
            <p className="text-2xl font-bold text-red-800">
              {metrics.criticalStockItems}
            </p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md">
          <TrendingUp className="mr-4 text-green-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Total Value</p>
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
      <div className="flex justify-between mb-5">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search by product name, code, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>
        <button
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded flex items-center hover:bg-gray-200 transition"
          title="Advanced Filters"
        >
          <Filter className="mr-2" size={18} /> Filters
        </button>
      </div>

      {/* Inventory Cards - New minimalistic design with cards instead of table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {paginatedInventory.length > 0 ? (
          paginatedInventory.map((product) => (
            <div
              key={product.product_id}
              onClick={() => handleProductClick(product.product_id)}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                product.qty <= product.min_stock
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-800 truncate flex-grow">
                  {product.product_name}
                </h3>
                <ChevronRight size={18} className="text-gray-400 ml-2" />
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Code: {product.product_code}</span>
                <span>Category: {product.category}</span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div>
                  <span className="text-gray-600 text-sm">Quantity:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      product.qty <= product.min_stock
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {product.qty} {product.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-600 text-sm">Price:</span>
                  <span className="ml-2 font-semibold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(product.standard_price)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            {searchTerm ? (
              <div>
                <p className="mb-2">No products match your search criteria.</p>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <p>No products found. Add your first product to get started.</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredInventory.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of{" "}
            {filteredInventory.length} products
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  prev * itemsPerPage < filteredInventory.length
                    ? prev + 1
                    : prev
                )
              }
              disabled={currentPage * itemsPerPage >= filteredInventory.length}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
