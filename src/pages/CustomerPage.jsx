import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const baseUrl = import.meta.env.VITE_BASE_URL || "";

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setSearch(searchTerm);
      setPage(1);
      fetchCustomers(1, rowsPerPage, searchTerm, sortBy, sortOrder);
    }, 500),
    [rowsPerPage, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchCustomers(page, rowsPerPage, search, sortBy, sortOrder);
  }, [page, rowsPerPage, sortBy, sortOrder]);

  const fetchCustomers = async (
    currentPage,
    limit,
    searchTerm,
    sort,
    order
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = new URL(`${baseUrl}/api/customer/all`);

      // Add query parameters
      url.searchParams.append("page", currentPage);
      url.searchParams.append("limit", limit);
      if (searchTerm) url.searchParams.append("search", searchTerm);
      url.searchParams.append("sort_by", sort);
      url.searchParams.append("sort_order", order);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success === true) {
        setCustomers(data.data.customers || []);
        setTotalPages(data.data.meta.pages || 1);
        setTotalCustomers(data.data.meta.total || 0);
        setError(null);
      } else {
        throw new Error(data.message || "Failed to fetch customers");
      }
    } catch (err) {
      setError(`Error fetching customers: ${err.message}`);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to ascending order for a new column
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Management
        </h1>
        <div className="mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              onChange={handleSearchChange}
              placeholder="Search customers..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("code")}
              >
                Code {getSortIcon("code")}
              </th>
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("name")}
              >
                Name {getSortIcon("name")}
              </th>
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("phone")}
              >
                Phone {getSortIcon("phone")}
              </th>
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("city")}
              >
                City {getSortIcon("city")}
              </th>
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 border-b cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort("price_type")}
              >
                Price Type {getSortIcon("price_type")}
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700 border-b">
                Address
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700 border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 px-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 border-b">{customer.code}</td>
                  <td className="py-3 px-4 border-b font-medium">
                    {customer.name}
                  </td>
                  <td className="py-3 px-4 border-b">{customer.phone}</td>
                  <td className="py-3 px-4 border-b">{customer.city}</td>
                  <td className="py-3 px-4 border-b">{customer.price_type}</td>
                  <td className="py-3 px-4 border-b">
                    <div className="max-w-xs truncate">
                      {customer.address1}
                      {customer.address2 && `, ${customer.address2}`}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          /* View Customer Details */
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => {
                          /* Edit Customer */
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => {
                          /* Delete Customer */
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-4 sm:mb-0">
          <span className="text-gray-600">
            Showing {customers.length} of {totalCustomers} customers
          </span>
        </div>

        <div className="flex items-center">
          <div className="mr-4">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            <span className="px-4 py-1 text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
