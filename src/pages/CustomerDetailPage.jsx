import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronLeft,
  Edit2,
  Share2,
  Download,
  Clipboard,
  FileText,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(6); // Default: 6 months

  // Fetch customer details and sales data
  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Fetch customer details
        const customerResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/customer/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!customerResponse.ok) {
          throw new Error("Failed to fetch customer details");
        }

        const customerData = await customerResponse.json();

        // Fetch sales data
        const salesResponse = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/customer/${customerId}/sales?months=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!salesResponse.ok) {
          throw new Error("Failed to fetch sales data");
        }

        const salesData = await salesResponse.json();
        // console.log(salesData);
        setCustomer(customerData.data);
        setSalesData(salesData.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, timeRange]);

  // Handle back navigation
  const goBack = () => {
    navigate("/customer");
  };

  // Number formatter for currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format large numbers
  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Create colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

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
          <p className="font-medium">Error loading customer data</p>
        </div>
        <p className="mb-4">{error}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/customer")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center"
          >
            <ChevronLeft className="mr-2" size={16} /> Back to Customers
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center"
          >
            <RefreshCw className="mr-2" size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // If customer data exists but no sales data
  if (!salesData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={goBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Customers
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {customer?.business_name}
            </h1>
            <p className="text-gray-500 text-sm">{customer?.customer_id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition"
              title="Edit Customer"
            >
              <Edit2 className="mr-2" size={18} /> Edit
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-500 mr-2" size={20} />
            <p className="text-yellow-700">
              No sales data available for this customer.
            </p>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-3">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <User size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-medium">
                  {customer?.owner_name || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Building size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium">
                  {customer?.price_type || "Standard"}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {customer?.address_1}
                  {customer?.city ? `, ${customer.city}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax ID (NPWP)</p>
                <p className="font-medium">
                  {customer?.npwp || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <button
        onClick={goBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to Customers
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {customer?.business_name}
          </h1>
          <p className="text-gray-500 text-sm">
            Customer ID: {customer?.customer_id}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition"
            title="Export Data"
          >
            <Download className="mr-2" size={18} /> Export
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition"
            title="Edit Customer"
          >
            <Edit2 className="mr-2" size={18} /> Edit
          </button>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-3">
              <DollarSign size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-semibold">
                {formatCurrency(salesData.total_sales)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-md p-4 border border-green-100">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <ShoppingCart size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-semibold">
                {formatNumber(salesData.total_orders)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-md p-4 border border-purple-100">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-3">
              <TrendingUp size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-xl font-semibold">
                {salesData.total_orders > 0
                  ? formatCurrency(
                      salesData.total_sales / salesData.total_orders
                    )
                  : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100 rounded-md inline-flex p-1">
          {[3, 6, 12, 24, 36].map((months) => (
            <button
              key={months}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === months
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setTimeRange(months)}
            >
              {months} Months
            </button>
          ))}
        </div>
      </div>

      {/* Sales Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesData.sales_by_month}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    compactDisplay: "short",
                    currency: "IDR",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Sales"]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column layout for Product Details and Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>

          {salesData.top_products.length > 0 ? (
            <>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesData.top_products}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_amount"
                      nameKey="product_name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {salesData.top_products.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-y-auto max-h-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Top 8 Product</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.top_products.map((product, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="p-2">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></div>
                            {product.product_name}
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(product.qty)}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(product.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>No product data available</p>
            </div>
          )}
        </div>

        {/* Customer Details and Recent Transactions */}
        <div className="flex flex-col gap-6">
          {/* Customer Details Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 className="text-lg font-semibold mb-3">Customer Information</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <User size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner Name</p>
                  <p className="font-medium">
                    {customer?.owner_name || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Building size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium">
                    {customer?.price_type || "Standard"}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <MapPin size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {customer?.address_1}
                    {customer?.city ? `, ${customer.city}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tax ID (NPWP)</p>
                  <p className="font-medium">
                    {customer?.npwp || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex-grow">
            <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>

            {salesData.recent_transactions &&
            salesData.recent_transactions.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Invoice</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.recent_transactions.map((transaction, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-2 font-medium">
                          {transaction.invoice_id}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Calendar
                              size={12}
                              className="mr-1 text-gray-400"
                            />
                            {new Date(
                              transaction.invoice_date
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(transaction.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <Clock size={32} className="mb-3 opacity-20" />
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
