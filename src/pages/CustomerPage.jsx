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
  User,
  ChevronRight,
  AlertCircle,
  X,
  CheckCircle,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  Upload,
  Save,
  AlertTriangle,
} from "lucide-react";

const CustomerPage = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Handle clicking outside the city dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/customer/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      // Sort customers by purchase amount (descending) - already done in the backend
      const sortedCustomers = data.data;

      setCustomers(sortedCustomers);

      // Extract unique cities for filter
      const cities = [
        ...new Set(
          sortedCustomers
            .map((customer) => customer.city)
            .filter((city) => city && city.trim() !== "")
        ),
      ].sort();

      setAvailableCities(cities);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtering and Search
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // First filter by selected city if any
      if (selectedCity && customer.city !== selectedCity) {
        return false;
      }

      // Then filter by search term
      if (searchTerm) {
        return Object.values(customer).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return true;
    });
  }, [customers, searchTerm, selectedCity]);

  // Pagination
  const itemsPerPage = 10;
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity]);

  // Delete customer
  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/api/customer/delete/${customerToDelete.customer_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete customer");
      }

      // Remove from customers list
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));

      // Close modal
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);

      // Show success message
      alert("Customer deleted successfully");
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // Navigate to customer detail
  const goToCustomerDetail = (customerId) => {
    navigate(`/customer/${customerId}`);
  };

  // Open import modal
  const handleOpenImport = () => {
    setImportFile(null);
    setImportError(null);
    setIsImportModalOpen(true);
  };

  // Handle file selection for import
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    setImportError(null);
  };

  // Import customers from file
  const handleImportCustomers = async () => {
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

      const response = await fetch(`${baseUrl}/api/import/customers`, {
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

      // Close modal and refresh customer list
      setIsImportModalOpen(false);
      fetchCustomers();
      alert("Customers imported successfully");
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // Export customers to Excel
  const exportCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = `${baseUrl}/api/customer/export`;

      // Add filter if city is selected
      if (selectedCity) {
        url += `?city=${encodeURIComponent(selectedCity)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export customers");
      }

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "customers_export.xlsx";
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
      alert("Customers exported successfully to Excel");
    } catch (err) {
      console.error("Error exporting customers:", err);
      alert(`Error exporting customers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (customer) => {
    setEditCustomerData({ ...customer });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCustomerData((prev) => ({
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

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    if (!editCustomerData.business_name?.trim()) {
      errors.business_name = "Business name is required";
    }
    return errors;
  };

  // Submit edit form
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
        `${baseUrl}/api/customer/update/${editCustomerData.customer_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_name: editCustomerData.business_name,
            owner_name: editCustomerData.owner_name,
            city: editCustomerData.city,
            extra: editCustomerData.extra,
            address_1: editCustomerData.address_1,
            price_type: editCustomerData.price_type,
            npwp: editCustomerData.npwp,
            nik: editCustomerData.nik,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update customer");
      }

      // Close modal and refresh data
      setIsEditModalOpen(false);
      fetchCustomers();
      alert("Customer updated successfully");
    } catch (err) {
      setEditFormErrors({
        general: err.message,
      });
    } finally {
      setEditSubmitting(false);
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
          <p className="font-medium">Error loading customers</p>
        </div>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchCustomers}
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition"
            title="Import Customers"
            onClick={handleOpenImport}
          >
            <Upload className="mr-2" size={18} /> Import Customers
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition"
            title="Refresh Customers"
            onClick={fetchCustomers}
          >
            <RefreshCw className="mr-2" size={18} /> Refresh
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-600 transition"
            title="Export Customers to Excel"
            onClick={exportCustomers}
            disabled={loading}
          >
            <Download className="mr-2" size={18} /> Export to Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-3">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-xl font-semibold">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-md p-4 border border-green-100">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <MapPin size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cities</p>
              <p className="text-xl font-semibold">{availableCities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-md p-4 border border-purple-100">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-3">
              <FileText size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-xl font-semibold">
                {customers.filter((c) => c.total_purchases > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search customers by name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        {/* City filter dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
          >
            <MapPin className="mr-2" size={18} />
            {selectedCity || "Filter by City"}
            <ChevronDown className="ml-2" size={16} />
          </button>

          {showCityDropdown && (
            <div className="absolute z-10 right-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 max-h-64 overflow-y-auto">
              <div className="px-3 py-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search cities..."
                  className="w-full px-2 py-1 border rounded-md text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setSelectedCity("");
                  setShowCityDropdown(false);
                }}
              >
                All Cities
              </button>

              {availableCities.map((city) => (
                <button
                  key={city}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    selectedCity === city
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedCity(city);
                    setShowCityDropdown(false);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Customer ID
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Business Name
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Owner
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                City
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Phone
              </th>
              <th className="p-3 text-right text-sm font-medium text-gray-500">
                Total Purchases
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => goToCustomerDetail(customer.customer_id)}
                >
                  <td className="p-3 font-medium">{customer.customer_id}</td>
                  <td className="p-3">{customer.business_name}</td>
                  <td className="p-3">{customer.owner_name || "-"}</td>
                  <td className="p-3">{customer.city || "-"}</td>
                  <td className="p-3">{customer.extra || "-"}</td>
                  <td className="p-3 font-medium text-right">
                    {formatCurrency(customer.total_purchases || 0)}
                  </td>
                  <td
                    className="p-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex space-x-2 justify-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                        title="Edit Customer"
                        onClick={() => handleOpenEdit(customer)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`text-red-500 p-1 rounded-full ${
                          customer.total_purchases > 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-red-50 hover:text-red-700"
                        }`}
                        title={
                          customer.total_purchases > 0
                            ? "Cannot delete customer with existing purchases"
                            : "Delete Customer"
                        }
                        onClick={() => confirmDelete(customer)}
                        disabled={customer.total_purchases > 0}
                        aria-disabled={customer.total_purchases > 0}
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-50"
                        title="View Details"
                        onClick={() => goToCustomerDetail(customer.customer_id)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {searchTerm || selectedCity ? (
                    <div>
                      <p className="mb-2">
                        No customers match your search criteria.
                      </p>
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCity("");
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <p>
                      No customers found. Import your first customer to get
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
      {filteredCustomers.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{" "}
            {filteredCustomers.length} customers
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
                  prev * itemsPerPage < filteredCustomers.length
                    ? prev + 1
                    : prev
                )
              }
              disabled={currentPage * itemsPerPage >= filteredCustomers.length}
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
            {customerToDelete?.total_purchases > 0 ? (
              <>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4 flex items-start">
                  <AlertTriangle
                    className="text-yellow-500 mr-2 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="font-medium text-yellow-700">
                      Cannot delete customer
                    </p>
                    <p className="text-yellow-600">
                      This customer has existing transactions and cannot be
                      deleted.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setCustomerToDelete(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete customer{" "}
                  <span className="font-medium">
                    {customerToDelete?.business_name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setCustomerToDelete(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    onClick={handleDeleteCustomer}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Import Customers</h3>
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
                Upload a CSV, XLS, or XLSX file containing customer data.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                The file should have the following columns: customer_code,
                customer_id, business_name, owner_name, city, etc.
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
                    <FileText className="mr-2 text-blue-500" size={24} />
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
                      CSV, XLS, XLSX up to 10MB
                    </p>
                  </div>
                )}
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
                onClick={handleImportCustomers}
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

      {/* Edit Customer Modal */}
      {isEditModalOpen && editCustomerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Edit Customer</h3>
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
                {/* Customer ID - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    name="customer_id"
                    value={editCustomerData.customer_id}
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-100"
                  />
                </div>

                {/* Customer Code - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Code
                  </label>
                  <input
                    type="text"
                    name="customer_code"
                    value={editCustomerData.customer_code}
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-100"
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={editCustomerData.business_name || ""}
                    onChange={handleEditInputChange}
                    className={`w-full p-2 border rounded-md ${
                      editFormErrors.business_name ? "border-red-500" : ""
                    }`}
                  />
                  {editFormErrors.business_name && (
                    <p className="mt-1 text-sm text-red-500">
                      {editFormErrors.business_name}
                    </p>
                  )}
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={editCustomerData.owner_name || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={editCustomerData.city || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="extra"
                    value={editCustomerData.extra || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address_1"
                    value={editCustomerData.address_1 || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                {/* NPWP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NPWP
                  </label>
                  <input
                    type="text"
                    name="npwp"
                    value={editCustomerData.npwp || ""}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded-md"
                  />
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
    </div>
  );
};

export default CustomerPage;
