import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Calendar,
  Clock,
  ChevronRight,
  CreditCard,
  BarChart2,
  RefreshCw,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import useAuth from "../hooks/useAuth";

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format numbers with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Get current date
  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("id-ID", options);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/dashboard/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || "Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigate to other pages
  const navigateTo = (path) => {
    navigate(path);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">
                Error loading dashboard
              </p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} className="mr-2" /> Retry
        </button>
      </div>
    );
  }

  // Extract data for convenience
  const { sales, inventory, customers, top_products, recent_transactions } =
    dashboardData || {};

  // Calculate target achievement percentage
  const targetAchievement = sales?.target
    ? Math.min(100, (sales.current_month / sales.target) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {currentUser?.full_name || "User"}
            </h1>
            <p className="text-gray-600">{getCurrentDate()}</p>
          </div>
        </div>
      </div>

      {/* Target Progress Card */}
      {sales?.target && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Monthly Sales Target
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(sales.target)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-md">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">
                Progress: {targetAchievement.toFixed(1)}%
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(sales.current_month)} of{" "}
                {formatCurrency(sales.target)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  targetAchievement >= 90
                    ? "bg-green-500"
                    : targetAchievement >= 60
                    ? "bg-blue-500"
                    : targetAchievement >= 30
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${targetAchievement}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {targetAchievement >= 100
                ? "🎉 Target achieved! Excellent performance."
                : targetAchievement >= 80
                ? "👍 Well on track to meet the monthly target."
                : targetAchievement >= 50
                ? "🔍 Progress is steady. Keep pushing to reach target."
                : "⚠️ Target at risk. Increased focus required."}
            </div>
          </div>
        </div>
      )}

      {/* Sales Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`bg-white rounded-lg shadow-sm p-6 ${
            sales?.growth_percentage >= 0
              ? "border-l-4 border-green-500"
              : "border-l-4 border-red-500"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Monthly Sales</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(sales?.current_month || 0)}
              </p>
              <div className="mt-2 flex items-center">
                {sales?.growth_percentage >= 0 ? (
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                ) : (
                  <TrendingDown size={16} className="text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    sales?.growth_percentage >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercent(sales?.growth_percentage || 0)}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            Month-end projection:{" "}
            {formatCurrency(sales?.projected_month_end || 0)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatNumber(sales?.current_month_orders || 0)}
              </p>
              <div className="mt-2 flex items-center">
                <CreditCard size={16} className="text-blue-500 mr-1" />
                <span className="text-sm font-medium">
                  {formatNumber(sales?.last_month_orders || 0)}
                </span>
                <span className="text-xs text-gray-500 ml-1">last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            Avg. Order Value:{" "}
            {formatCurrency(
              sales?.current_month_orders
                ? sales.current_month / sales.current_month_orders
                : 0
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Inventory Value
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(inventory?.inventory_value || 0)}
              </p>
              <div className="mt-2 flex items-center">
                <Package size={16} className="text-yellow-500 mr-1" />
                <span className="text-sm font-medium">
                  {formatNumber(inventory?.total_products || 0)}
                </span>
                <span className="text-xs text-gray-500 ml-1">products</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-md">
              <Package className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 flex items-center">
            <AlertTriangle size={14} className="text-red-500 mr-1" />
            <span>
              {inventory?.low_stock_count || 0} items below minimum stock
            </span>
          </div>
        </div>
      </div>

      {/* Chart and Top Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Sales Trend</h2>
            <div className="text-sm text-gray-500">Last 6 Months</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sales?.trend || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    formatCurrency(value).replace(/[IDR\s]/g, "")
                  }
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Sales"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Top Products</h2>
            <button
              onClick={() => navigateTo("/inventory")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          {top_products && top_products.length > 0 ? (
            <div className="space-y-4">
              {top_products.map((product, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => navigateTo(`/inventory/${product.product_id}`)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className="font-medium text-gray-800"
                      title={product.product_name}
                    >
                      {product.product_name.length > 24
                        ? product.product_name.substring(0, 24) + "..."
                        : product.product_name}
                    </h3>
                    <span className="text-sm font-semibold">
                      {formatNumber(product.quantity)} units
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(product.total_sales)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag size={40} className="mx-auto mb-4 text-gray-300" />
              <p>No sales data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions and Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              Recent Transactions
            </h2>
            <button
              onClick={() => navigateTo("/customer")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          {recent_transactions && recent_transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recent_transactions.map((transaction, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigateTo(`/customer/${transaction.customer_id}`)
                      }
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.invoice_id}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-600"
                        title={transaction.customer_name}
                      >
                        {transaction.customer_name.length > 20
                          ? transaction.customer_name.substring(0, 20) + "..."
                          : transaction.customer_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag size={40} className="mx-auto mb-4 text-gray-300" />
              <p>No recent transactions</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              Low Stock Alerts
            </h2>
            <button
              onClick={() => navigateTo("/inventory")}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          {inventory?.low_stock_items &&
          inventory.low_stock_items.length > 0 ? (
            <div className="space-y-4">
              {inventory.low_stock_items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition cursor-pointer"
                  onClick={() => navigateTo(`/inventory/${item.product_id}`)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className="font-medium text-gray-800"
                      title={item.product_name}
                    >
                      {item.product_name.length > 22
                        ? item.product_name.substring(0, 22) + "..."
                        : item.product_name}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-red-600">
                      <AlertTriangle size={14} className="mr-1" />
                      <span>
                        {item.current_stock} {item.unit}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Min: {item.min_stock} {item.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package size={40} className="mx-auto mb-4 text-gray-300" />
              <p>No low stock items</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Active Customers
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatNumber(customers?.active_customers || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {/* {formatNumber(customers?.new_customers || 0)} new this month */}
            Have made transactions this month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Avg Daily Sales
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(
                  sales?.current_month
                    ? sales.current_month / new Date().getDate()
                    : 0
                )}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Based on this month's data
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-yellow-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Inventory Status
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatNumber(inventory?.total_products || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Package className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {formatNumber(inventory?.low_stock_count || 0)} items low on stock
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Latest Activity
              </p>
              <p className="text-lg font-medium text-gray-800 mt-1">
                {recent_transactions && recent_transactions.length > 0
                  ? recent_transactions[0].invoice_id
                  : "No recent activity"}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {recent_transactions && recent_transactions.length > 0
              ? new Date(recent_transactions[0].date).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
