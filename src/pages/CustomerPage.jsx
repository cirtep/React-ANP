import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  PlusCircle,
  Download,
  RefreshCw,
} from "lucide-react";

const CustomerPage = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

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
          onClick={fetchCustomers}
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
          Customer Management
        </h1>
        <div className="flex items-center space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600 transition"
            title="Add New Customer"
          >
            <PlusCircle className="mr-2" size={20} /> Add Customer
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600 transition"
            title="Export Customers"
          >
            <Download className="mr-2" size={20} /> Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between mb-4">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search customers..."
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

      {/* Customer Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
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
                  className="form-checkbox"
                />
              </th>
              <th className="p-3 text-left">Customer Code</th>
              <th className="p-3 text-left">Business Name</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Price Type</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleSelectCustomer(customer.id)}
                    className="form-checkbox"
                  />
                </td>
                <td className="p-3">{customer.customer_code}</td>
                <td className="p-3">{customer.business_name}</td>
                <td className="p-3">{customer.city}</td>
                <td className="p-3">
                  <span
                    className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${
                      customer.price_type === "Retail"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }
                  `}
                  >
                    {customer.price_type}
                  </span>
                </td>
                <td className="p-3 flex space-x-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Customer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    title="Delete Customer"
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
          {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{" "}
          {filteredCustomers.length} customers
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
                prev * itemsPerPage < filteredCustomers.length ? prev + 1 : prev
              )
            }
            disabled={currentPage * itemsPerPage >= filteredCustomers.length}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
