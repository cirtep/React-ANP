import React, { useState, useEffect, useMemo } from "react";
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

  const navigate = useNavigate();

  // Pagination
  const itemsPerPage = 10;

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
      setCustomers(data.data);
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
    return customers.filter((customer) =>
      Object.values(customer).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [customers, searchTerm]);

  // Pagination
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage]);

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
          >
            <PlusCircle className="mr-2" size={18} /> Add Customer
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition"
            title="Export Customers"
            onClick={fetchCustomers}
          >
            <RefreshCw className="mr-2" size={18} /> Refresh
          </button>
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition"
            title="Export Customers"
          >
            <Download className="mr-2" size={18} /> Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between mb-5">
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
        <button
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition"
          title="Advanced Filters"
        >
          <Filter className="mr-2" size={18} /> Filters
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-3">
              <User size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-xl font-semibold">{customers.length}</p>
            </div>
          </div>
        </div>
        {/* <div className="bg-green-50 rounded-md p-4 border border-green-100">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <User size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-xl font-semibold">{customers.length}</p>
            </div>
          </div>
        </div> */}
        {/* <div className="bg-purple-50 rounded-md p-4 border border-purple-100">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-3">
              <User size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div> */}
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
                Customer Code
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
                Price Type
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
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
                  <td className="p-3 font-medium">{customer.customer_code}</td>
                  <td className="p-3">{customer.business_name}</td>
                  <td className="p-3">{customer.owner_name || "-"}</td>
                  <td className="p-3">{customer.city || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        customer.price_type === "Retail"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }
                    `}
                    >
                      {customer.price_type || "Standard"}
                    </span>
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
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
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {searchTerm ? (
                    <div>
                      <p className="mb-2">
                        No customers match your search criteria.
                      </p>
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear search
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
    </div>
  );
};

export default CustomerPage;
