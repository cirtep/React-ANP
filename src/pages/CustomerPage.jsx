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
} from "lucide-react";

const CustomerPage = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_code: "",
    customer_id: "",
    business_name: "",
    owner_name: "",
    city: "",
    phone: "",
    address_1: "",
    price_type: "Standard",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/customer/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      // Sort customers by purchase amount (descending)
      const sortedCustomers = [...data.data].sort(
        (a, b) => (b.total_purchases || 0) - (a.total_purchases || 0)
      );

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

  // Select/Deselect customer
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Select all customers on current page
  const handleSelectAllOnPage = () => {
    const currentPageCustomerIds = paginatedCustomers.map((c) => c.id);
    setSelectedCustomers((prev) => {
      const allSelected = currentPageCustomerIds.every((id) =>
        prev.includes(id)
      );
      return allSelected
        ? prev.filter((id) => !currentPageCustomerIds.includes(id))
        : [...new Set([...prev, ...currentPageCustomerIds])];
    });
  };

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
        `${import.meta.env.VITE_BASE_URL}/api/customer/delete/${
          customerToDelete.customer_id
        }`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      // Remove from selected customers
      setSelectedCustomers((prev) =>
        prev.filter((id) => id !== customerToDelete.id)
      );

      // Remove from customers list
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));

      // Close modal
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  // Navigate to customer detail
  const goToCustomerDetail = (customerId) => {
    navigate(`/customer/${customerId}`);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.customer_code.trim()) {
      errors.customer_code = "Customer code is required";
    }
    if (!formData.customer_id.trim()) {
      errors.customer_id = "Customer ID is required";
    }
    if (!formData.business_name.trim()) {
      errors.business_name = "Business name is required";
    }

    return errors;
  };

  // Submit form to add customer
  const handleAddCustomer = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/customer/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add customer");
      }

      // Add new customer to list and close modal
      await fetchCustomers(); // Refresh the customer list
      setIsAddModalOpen(false);

      // Reset form
      setFormData({
        customer_code: "",
        customer_id: "",
        business_name: "",
        owner_name: "",
        city: "",
        phone: "",
        address_1: "",
        price_type: "Standard",
      });
      setFormErrors({});
    } catch (err) {
      setFormErrors({
        general: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export customers to CSV
  const exportCustomers = () => {
    // Create CSV header
    const headers = [
      "Customer ID",
      "Business Name",
      "Owner",
      "City",
      "Phone",
      "Address",
      "Price Type",
    ];

    // Map customers to CSV rows
    const csvData = filteredCustomers.map((customer) => [
      customer.customer_id || "",
      customer.business_name || "",
      customer.owner_name || "",
      customer.city || "",
      customer.phone || "",
      customer.address_1 || "",
      customer.price_type || "Standard",
    ]);

    // Add headers to the beginning
    csvData.unshift(headers);

    // Convert to CSV string
    const csvString = csvData
      .map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap cell in quotes if it contains commas or quotes
            const escaped = String(cell).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\\n");

    // Create download link
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    link.download = `customers_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <p className="text-gray-500 text-sm mt-1">
            Manage your customer database and view analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition"
            title="Add New Customer"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle className="mr-2" size={18} /> Add Customer
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
            title="Export Customers to CSV"
            onClick={exportCustomers}
          >
            <Download className="mr-2" size={18} /> Export CSV
          </button>
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
                  onChange={(e) => {
                    const searchValue = e.target.value.toLowerCase();
                    // Filtering happens in the rendered list below
                  }}
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

      {/* Customer Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    paginatedCustomers.length > 0 &&
                    paginatedCustomers.every((c) =>
                      selectedCustomers.includes(c.id)
                    )
                  }
                  onChange={handleSelectAllOnPage}
                  className="form-checkbox h-5 w-5 text-blue-500 rounded"
                />
              </th>
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
              <th className="p-3 text-left text-sm font-medium text-gray-500">
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
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="form-checkbox h-5 w-5 text-blue-500 rounded"
                    />
                  </td>
                  <td className="p-3 font-medium">{customer.customer_id}</td>
                  <td className="p-3">{customer.business_name}</td>
                  <td className="p-3">{customer.owner_name || "-"}</td>
                  <td className="p-3">{customer.city || "-"}</td>
                  <td className="p-3">{customer.extra || "-"}</td>
                  <td className="p-3 font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(customer.total_purchases || 0)}
                  </td>
                  <td
                    className="p-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex space-x-2 justify-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                        title="Edit Customer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        title="Delete Customer"
                        onClick={() => confirmDelete(customer)}
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
                <td colSpan="8" className="p-8 text-center text-gray-500">
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
                      No customers found. Add your first customer to get
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
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Add New Customer</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleAddCustomer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Customer Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_code"
                    value={formData.customer_code}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      formErrors.customer_code ? "border-red-500" : ""
                    }`}
                    placeholder="Enter customer code"
                  />
                  {formErrors.customer_code && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.customer_code}
                    </p>
                  )}
                </div>

                {/* Customer ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      formErrors.customer_id ? "border-red-500" : ""
                    }`}
                    placeholder="Enter customer ID"
                  />
                  {formErrors.customer_id && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.customer_id}
                    </p>
                  )}
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      formErrors.business_name ? "border-red-500" : ""
                    }`}
                    placeholder="Enter business name"
                  />
                  {formErrors.business_name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.business_name}
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
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter owner name"
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
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter city"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter phone number"
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
                    value={formData.address_1}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter address"
                  />
                </div>

                {/* Price Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Type
                  </label>
                  <select
                    name="price_type"
                    value={formData.price_type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} className="mr-2" />
                      Save Customer
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
