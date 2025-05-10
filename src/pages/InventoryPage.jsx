import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  PlusCircle,
  Download,
  RefreshCw,
  Package,
  ChevronRight,
  AlertCircle,
  X,
  Tag,
  MapPin,
  Folder,
  Box,
  ChevronDown,
  Upload,
  Save,
  AlertTriangle,
} from "lucide-react";

const InventoryPage = () => {
  // State management
  const [stockFilter, setStockFilter] = useState("all"); // "all", "low", or "critical"
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

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteModalType, setDeleteModalType] = useState("confirm"); // "confirm", "disallowed", "stock_warning"
  const [deleteModalInfo, setDeleteModalInfo] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Import modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState("product"); // "product" or "stock"
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductData, setEditProductData] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Dropdown states
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);

  // Refs
  const dropdownRef = useRef(null);
  const importDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Navigation
  const navigate = useNavigate();

  // API base URL
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Handle clicking outside the dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (
        importDropdownRef.current &&
        !importDropdownRef.current.contains(event.target)
      ) {
        setShowImportDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Pagination
  const itemsPerPage = 10;

  // Fetch inventory data
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/inventory/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

      // Extract unique categories for filter
      const categories = [
        ...new Set(
          responseData.data
            .map((product) => product.category)
            .filter((category) => category && category.trim() !== "")
        ),
      ].sort();

      setAvailableCategories(categories);

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

  // Reset filters when changing stock filter
  useEffect(() => {
    setCurrentPage(1);
  }, [stockFilter]);

  // Filtering and Search
  const filteredInventory = useMemo(() => {
    return inventory.filter((product) => {
      // First filter by stock status if selected
      if (stockFilter === "low") {
        if (!(product.qty <= product.min_stock)) {
          return false;
        }
      } else if (stockFilter === "critical") {
        if (!(product.qty <= product.min_stock / 2)) {
          return false;
        }
      }

      // Then filter by selected category if any
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }

      // Finally filter by search term
      if (searchTerm) {
        return (
          product.product_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.product_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.product_id
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return true;
    });
  }, [inventory, searchTerm, selectedCategory, stockFilter]);

  // Pagination
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Delete product
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalType("confirm");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async (force = false) => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");

      // Add force parameter if needed
      const queryParam = force ? "?force=true" : "";

      const response = await fetch(
        `${baseUrl}/api/inventory/delete/${productToDelete.product_id}${queryParam}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle special cases
        if (result.deletion_type === "disallowed") {
          // Product has transactions - show message that deletion is not allowed
          setDeleteModalType("disallowed");
          setDeleteModalInfo({
            productName: productToDelete.product_name,
            transactionCount: result.data.transaction_count,
          });
          setDeleteLoading(false);
          return;
        } else if (result.deletion_type === "warning") {
          // Product has stock - show confirmation
          setDeleteModalType("stock_warning");
          setDeleteModalInfo({
            productName: productToDelete.product_name,
            stockQty: result.data.has_stock ? productToDelete.qty : 0,
            stockUnit: productToDelete.unit || "",
          });
          setDeleteLoading(false);
          return;
        }
        throw new Error(result.message || "Failed to delete product");
      }

      // Success
      alert("Product deleted successfully");

      // Remove from inventory list and close modal
      setInventory((prev) =>
        prev.filter((p) => p.product_id !== productToDelete.product_id)
      );
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setDeleteModalType("confirm");
      setDeleteLoading(false);
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(`Error: ${err.message}`);
      setDeleteLoading(false);
    }
  };

  // Navigate to product detail
  const goToProductDetail = (productId) => {
    navigate(`/inventory/${productId}`);
  };

  // Edit product
  const handleOpenEdit = (product) => {
    setEditProductData({ ...product });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProductData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    // Convert to number if value is not empty
    const numericValue = value === "" ? "" : Number(value);

    setEditProductData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));

    // Clear error for this field
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editProductData.product_name?.trim()) {
      errors.product_name = "Product name is required";
    }
    if (
      editProductData.standard_price === undefined ||
      editProductData.standard_price === null ||
      editProductData.standard_price === ""
    ) {
      errors.standard_price = "Standard price is required";
    }
    if (
      editProductData.qty === undefined ||
      editProductData.qty === null ||
      editProductData.qty === ""
    ) {
      errors.qty = "Quantity is required";
    }
    return errors;
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setEditSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${baseUrl}/api/inventory/update/${editProductData.product_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_name: editProductData.product_name,
            standard_price: editProductData.standard_price,
            retail_price: editProductData.retail_price,
            category: editProductData.category,
            min_stock: editProductData.normal_min_stock,
            max_stock: editProductData.normal_max_stock,
            supplier_id: editProductData.supplier_id,
            supplier_name: editProductData.supplier_name,
            location: editProductData.location,
            qty: editProductData.qty,
            unit: editProductData.unit,
            ppn: editProductData.ppn,
            use_forecast: Boolean(editProductData.use_forecast),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      // Close modal and refresh data
      setIsEditModalOpen(false);
      fetchInventoryData();
      alert("Product updated successfully");
    } catch (err) {
      setEditFormErrors({
        general: err.message,
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open import modal
  const handleOpenImport = (type) => {
    setImportFile(null);
    setImportError(null);
    setImportType(type);
    setIsImportModalOpen(true);
  };

  // Handle file selection for import
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    setImportError(null);
  };

  // Import products or stock from file
  const handleImport = async () => {
    if (!importFile) {
      setImportError("Please select a file to import");
      return;
    }

    const fileExtension = importFile.name.split(".").pop().toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(fileExtension)) {
      setImportError(
        "Invalid file format. Please use CSV, XLS, or XLSX files."
      );
      return;
    }

    setImportLoading(true);
    setImportError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", importFile);

      // Determine import endpoint based on type
      const endpoint =
        importType === "product"
          ? `${baseUrl}/api/import/products`
          : `${baseUrl}/api/import/product_stock`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Import failed");
      }

      // Close modal and refresh inventory list
      setIsImportModalOpen(false);
      fetchInventoryData();

      // Display detailed success message
      let successMessage = `${
        importType === "product" ? "Products" : "Product stock"
      } imported successfully`;

      // If we have detailed counts in the message, extract and display them
      if (
        result.message.includes("New records") ||
        result.message.includes("Updated records")
      ) {
        successMessage = result.message;
      }

      alert(successMessage);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // Export inventory to Excel
  const exportInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = `${baseUrl}/api/inventory/export`;

      // Add filter if category is selected
      if (selectedCategory) {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export inventory");
      }

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "inventory_export.xlsx";
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url2 = window.URL.createObjectURL(blob);

      // Create a link and trigger download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url2;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url2);
      document.body.removeChild(a);

      // Show success message
      alert("Inventory exported successfully to Excel");
    } catch (err) {
      console.error("Error exporting inventory:", err);
      alert(`Error exporting inventory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with thousands separator
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <div className="flex items-center mb-3">
          <AlertCircle className="mr-2" size={20} />
          <p className="font-medium">Error loading inventory</p>
        </div>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchInventoryData}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center"
        >
          <RefreshCw className="mr-2" size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div
            className="relative flex-grow sm:flex-grow-0"
            ref={importDropdownRef}
          >
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center hover:bg-blue-600 transition w-full justify-center sm:justify-start"
              onClick={() => setShowImportDropdown(!showImportDropdown)}
            >
              <Upload className="mr-2" size={18} />
              <span className="hidden sm:inline">Import</span>
              <span className="sm:hidden">Import</span>
              <ChevronDown className="ml-2" size={16} />
            </button>

            {showImportDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowImportDropdown(false);
                    handleOpenImport("product");
                  }}
                >
                  Import Products
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowImportDropdown(false);
                    handleOpenImport("stock");
                  }}
                >
                  Import Product Stock
                </button>
              </div>
            )}
          </div>

          <button
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md flex items-center hover:bg-gray-200 transition flex-grow sm:flex-grow-0 justify-center sm:justify-start"
            title="Refresh Inventory"
            onClick={fetchInventoryData}
          >
            <RefreshCw className="mr-2" size={18} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </button>

          <button
            className="bg-green-500 text-white px-3 py-2 rounded-md flex items-center hover:bg-green-600 transition flex-grow sm:flex-grow-0 justify-center sm:justify-start"
            title="Export Inventory to Excel"
            onClick={exportInventory}
            disabled={loading}
          >
            <Download className="mr-2" size={18} />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <div
          className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md relative group"
          title="Total number of items in your inventory"
        >
          <Box className="mr-4 text-blue-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-blue-800">
              {metrics.totalItems}
            </p>
          </div>
        </div>
        <div
          className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md relative group"
          title="Items with stock levels at or below the minimum stock level"
        >
          <AlertTriangle className="mr-4 text-yellow-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-800">
              {metrics.lowStockItems}
            </p>
          </div>
        </div>
        <div
          className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md relative group"
          title="Items with critically low stock (50% of minimum stock or lower)"
        >
          <AlertCircle className="mr-4 text-red-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Critical Stock</p>
            <p className="text-2xl font-bold text-red-800">
              {metrics.criticalStockItems}
            </p>
          </div>
        </div>
        <div
          className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center transition-all hover:shadow-md relative group"
          title="Total value of all inventory items (qty × standard price)"
        >
          <Tag className="mr-4 text-green-600" size={28} />
          <div>
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(metrics.totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search by product name, code, ID, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center bg-gray-100 rounded-md">
          <button
            className={`px-3 py-2 rounded-md text-sm flex items-center ${
              stockFilter === "all"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setStockFilter("all")}
          >
            <Package className="mr-1" size={16} />
            All
          </button>

          <button
            className={`px-3 py-2 rounded-md text-sm flex items-center ${
              stockFilter === "low"
                ? "bg-white text-yellow-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setStockFilter("low")}
          >
            <AlertTriangle className="mr-1" size={16} />
            Low Stock
          </button>

          <button
            className={`px-3 py-2 rounded-md text-sm flex items-center ${
              stockFilter === "critical"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setStockFilter("critical")}
          >
            <AlertCircle className="mr-1" size={16} />
            Critical
          </button>
        </div>

        {/* Category filter dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Folder className="mr-2" size={18} />
            {selectedCategory || "Filter by Category"}
            <ChevronDown className="ml-2" size={16} />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-10 right-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 max-h-64 overflow-y-auto">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setSelectedCategory("");
                  setShowCategoryDropdown(false);
                }}
              >
                All Categories
              </button>

              {availableCategories.map((category) => (
                <button
                  key={category}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    selectedCategory === category
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCategoryDropdown(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Product ID
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Product Name
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Category
              </th>
              <th className="p-3 text-right text-sm font-medium text-gray-500">
                Quantity
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Unit
              </th>
              <th className="p-3 text-right text-sm font-medium text-gray-500">
                Price
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.length > 0 ? (
              paginatedInventory.map((product) => {
                // Determine stock status
                let stockStatus = "normal";
                let statusText = "Normal";
                let statusColor = "bg-green-100 text-green-800";

                if (product.qty <= product.min_stock / 2) {
                  stockStatus = "critical";
                  statusText = "Critical";
                  statusColor = "bg-red-100 text-red-800";
                } else if (product.qty <= product.min_stock) {
                  stockStatus = "low";
                  statusText = "Low Stock";
                  statusColor = "bg-yellow-100 text-yellow-800";
                }

                return (
                  <tr
                    key={product.product_id}
                    className={`border-t border-gray-200 hover:bg-gray-50 transition cursor-pointer ${
                      stockStatus === "critical"
                        ? "bg-red-50"
                        : stockStatus === "low"
                        ? "bg-yellow-50"
                        : ""
                    }`}
                    onClick={() => goToProductDetail(product.product_id)}
                  >
                    <td className="p-3 font-medium">{product.product_id}</td>
                    <td className="p-3">{product.product_name}</td>
                    <td className="p-3">{product.category || "-"}</td>
                    <td
                      className={`p-3 text-right font-medium ${
                        stockStatus === "critical"
                          ? "text-red-600"
                          : stockStatus === "low"
                          ? "text-yellow-600"
                          : ""
                      }`}
                    >
                      {formatNumber(product.qty)}
                    </td>
                    <td className="p-3">{product.unit || "-"}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(product.standard_price)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${statusColor}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td
                      className="p-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex space-x-2 justify-center">
                        <button
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                          title="Edit Product"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(product);
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="Delete Product"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(product);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-50"
                          title="View Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToProductDetail(product.product_id);
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  {searchTerm || selectedCategory || stockFilter !== "all" ? (
                    <div>
                      <p className="mb-2">
                        No products match your search criteria.
                      </p>
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("");
                          setStockFilter("all");
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <p>
                      No products found. Import your first product to get
                      started.
                    </p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition text-sm"
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
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium mb-2">Confirm deletion</h3>

            {deleteModalType === "confirm" && (
              <>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete product{" "}
                  <span className="font-medium">
                    {productToDelete?.product_name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setProductToDelete(null);
                    }}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
                    onClick={() => handleDeleteProduct(false)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </>
            )}

            {deleteModalType === "disallowed" && (
              <>
                <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                  <div className="flex items-start">
                    <AlertCircle
                      className="text-red-500 mr-2 mt-0.5"
                      size={20}
                    />
                    <div>
                      <p className="font-medium text-red-700">
                        Cannot delete this product
                      </p>
                      <p className="text-red-600">
                        This product is associated with{" "}
                        {deleteModalInfo.transactionCount} transactions and
                        cannot be deleted to maintain data integrity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setProductToDelete(null);
                      setDeleteModalType("confirm");
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {deleteModalType === "stock_warning" && (
              <>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle
                      className="text-yellow-500 mr-2 mt-0.5"
                      size={20}
                    />
                    <div>
                      <p className="font-medium text-yellow-700">
                        This product has remaining stock
                      </p>
                      <p className="text-yellow-600">
                        This product has {deleteModalInfo.stockQty}{" "}
                        {deleteModalInfo.stockUnit} remaining in inventory.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this product and its stock
                  data?
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setProductToDelete(null);
                      setDeleteModalType("confirm");
                    }}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
                    onClick={() => handleDeleteProduct(true)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete Anyway"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editProductData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Edit Product</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {editFormErrors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {editFormErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmitEdit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Product ID - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID
                  </label>
                  <input
                    type="text"
                    name="product_id"
                    value={editProductData.product_id}
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-100"
                  />
                </div>

                {/* Product Code - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Code
                  </label>
                  <input
                    type="text"
                    name="product_code"
                    value={editProductData.product_code}
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-100"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={editProductData.product_name || ""}
                    onChange={handleEditInputChange}
                    className={`w-full p-2 border rounded-md ${
                      editFormErrors.product_name ? "border-red-500" : ""
                    }`}
                  />
                  {editFormErrors.product_name && (
                    <p className="mt-1 text-sm text-red-500">
                      {editFormErrors.product_name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={editProductData.category || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                    list="categories"
                  />
                  <datalist id="categories">
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Standard Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="standard_price"
                    value={editProductData.standard_price || ""}
                    onChange={handleNumberInputChange}
                    className={`w-full p-2 border rounded-md ${
                      editFormErrors.standard_price ? "border-red-500" : ""
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {editFormErrors.standard_price && (
                    <p className="mt-1 text-sm text-red-500">
                      {editFormErrors.standard_price}
                    </p>
                  )}
                </div>

                {/* Retail Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retail Price
                  </label>
                  <input
                    type="number"
                    name="retail_price"
                    value={editProductData.retail_price || ""}
                    onChange={handleNumberInputChange}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="qty"
                    value={editProductData.qty || ""}
                    onChange={handleNumberInputChange}
                    className={`w-full p-2 border rounded-md ${
                      editFormErrors.qty ? "border-red-500" : ""
                    }`}
                    min="0"
                  />
                  {editFormErrors.qty && (
                    <p className="mt-1 text-sm text-red-500">
                      {editFormErrors.qty}
                    </p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={editProductData.unit || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock
                  </label>
                  <input
                    type="number"
                    name="normal_min_stock"
                    value={editProductData.normal_min_stock || ""}
                    onChange={handleNumberInputChange}
                    className="w-full p-2 border rounded-md"
                    min="0"
                  />
                </div>

                {/* Max Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Stock
                  </label>
                  <input
                    type="number"
                    name="normal_max_stock"
                    value={editProductData.normal_max_stock || ""}
                    onChange={handleNumberInputChange}
                    className="w-full p-2 border rounded-md"
                    min="0"
                  />
                </div>

                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    name="supplier_name"
                    value={editProductData.supplier_name || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Supplier ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier ID
                  </label>
                  <input
                    type="text"
                    name="supplier_id"
                    value={editProductData.supplier_id || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mb-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editProductData.location || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Use Forecast for Min/Max Stock
                  <span className="ml-2 text-xs text-gray-500">
                    (Uses forecast lower/upper bounds instead of fixed values)
                  </span>
                </label>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="use_forecast"
                    id="use_forecast"
                    checked={editProductData.use_forecast || false}
                    onChange={(e) => {
                      setEditProductData((prev) => ({
                        ...prev,
                        use_forecast: e.target.checked,
                      }));
                    }}
                    className="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer checked:right-0 checked:border-blue-500 focus:outline-none"
                  />
                  <label
                    htmlFor="use_forecast"
                    className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                      editProductData.use_forecast
                        ? "bg-blue-300"
                        : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">
                {importType === "product"
                  ? "Import Products"
                  : "Import Product Stock"}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsImportModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {importError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {importError}
              </div>
            )}

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Upload a XLSX file containing{" "}
                {importType === "product" ? "product" : "product stock"} data.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {importType === "product"
                  ? "The file should contain product codes, names, categories, and prices."
                  : "The file should contain product IDs and stock quantities."}
              </p>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                />
                {importFile ? (
                  <div className="flex items-center justify-center">
                    <Box className="mr-2 text-blue-500" size={24} />
                    <span className="font-medium text-blue-700">
                      {importFile.name}
                    </span>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to select or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      XLSX up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-md">
                <p className="font-medium mb-1">File Format Requirements:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {importType === "product" ? (
                    <>
                      <li>
                        Required columns: product_code, product_id,
                        product_name, standard_price
                      </li>
                      <li>
                        Optional: retail_price, ppn, category, min_stock,
                        max_stock, supplier_id, supplier_name
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        Required columns: judul (report date), cstdcode (product
                        ID), qty2 (quantity)
                      </li>
                      <li>
                        Optional: cwhsdesc (location), cunidesc (unit), harga2
                        (price)
                      </li>
                      <li>
                        Report date will be extracted from "judul" column in
                        format DD-MM-YYYY
                      </li>
                      <li>
                        Newer report dates will update existing stock records
                      </li>
                    </>
                  )}
                  <li>
                    Make sure your file has a header row with the expected
                    column names
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                onClick={handleImport}
                disabled={!importFile || importLoading}
              >
                {importLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
