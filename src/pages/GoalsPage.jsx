import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Layers,
  BarChart2,
  Package,
  DollarSign,
  Target,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
  ReferenceLine,
} from "recharts";

const GoalsPage = () => {
  // State declarations
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [goalsData, setGoalsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [productFilter, setProductFilter] = useState("");
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Performance thresholds
  const PERFORMANCE_THRESHOLDS = {
    EXCEEDED: 100, // 100% or more is exceeded
    ACHIEVED: 95, // 95% or more is achieved
    NEAR: 80, // 80% or more is near
    BELOW: 0, // Below 80% is underperforming
  };

  // Helper function to get current month in YYYY-MM format
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  // Generate month options for the last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      options.push({
        value: monthValue,
        label: date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    return options;
  }, []);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format number with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Fetch goals data when selected month changes
  useEffect(() => {
    const fetchGoalsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${baseUrl}/api/forecast/goals?month=${selectedMonth}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch goals data");
        }

        const result = await response.json();
        if (result.success) {
          setGoalsData(result.data);
        } else {
          throw new Error(result.message || "Failed to load goals data");
        }
      } catch (err) {
        console.error("Error fetching goals data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalsData();
  }, [selectedMonth, baseUrl]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!goalsData || !goalsData.products) return [];

    if (!productFilter) return goalsData.products;

    return goalsData.products.filter((product) =>
      product.product_name.toLowerCase().includes(productFilter.toLowerCase())
    );
  }, [goalsData, productFilter]);

  // Get performance badge styling based on status
  const getPerformanceBadge = (status) => {
    switch (status) {
      case "exceeded":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" /> Exceeded
          </span>
        );
      case "achieved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle size={12} className="mr-1" /> Achieved
          </span>
        );
      case "near":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} className="mr-1" /> Near Target
          </span>
        );
      case "below":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" /> Below Target
          </span>
        );
      default:
        return null;
    }
  };

  // Toggle expanded view for a product
  const toggleProductExpand = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  // Get historical trend data for a specific product
  const getProductTrendData = (productId) => {
    if (
      !goalsData ||
      !goalsData.historical_data ||
      !goalsData.historical_data[productId]
    ) {
      return [];
    }

    return goalsData.historical_data[productId].map((item) => ({
      month: item.month_name,
      Forecast: item.forecast || 0,
      Actual: item.actual || 0,
      // Include nulls for months without forecast to properly display the chart
      ForecastLine: item.forecast !== null ? item.forecast : null,
    }));
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
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">
                Error loading goals data
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

  // Render empty state if no goals data
  if (!goalsData || (goalsData.products && goalsData.products.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Sales Goals Dashboard
          </h1>

          <div className="relative">
            <button
              className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setShowMonthSelector(!showMonthSelector)}
            >
              <Calendar size={16} className="mr-2" />
              {monthOptions.find((option) => option.value === selectedMonth)
                ?.label || selectedMonth}
              <ChevronDown size={14} className="ml-2" />
            </button>

            {showMonthSelector && (
              <div className="absolute right-0 z-10 mt-1 w-60 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                <div className="max-h-60 overflow-y-auto">
                  {monthOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        selectedMonth === option.value
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedMonth(option.value);
                        setShowMonthSelector(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h3 className="text-gray-600 font-medium mb-2">No Forecasts Found</h3>
          <p className="text-gray-500 max-w-lg mx-auto mb-6">
            There are no saved forecasts for{" "}
            {monthOptions.find((option) => option.value === selectedMonth)
              ?.label || selectedMonth}
            . To establish sales targets, please go to the Forecast page,
            generate forecasts for your products, and save them.
          </p>
          <div className="flex justify-center">
            <a
              href="/forecast"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Go to Forecasts
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Extract summary metrics
  const summary = goalsData.summary || {};

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
          Sales Goals Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Month selector */}
          <div className="relative">
            <button
              className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setShowMonthSelector(!showMonthSelector)}
            >
              <Calendar size={16} className="mr-2" />
              {monthOptions.find((option) => option.value === selectedMonth)
                ?.label || selectedMonth}
              <ChevronDown size={14} className="ml-2" />
            </button>

            {showMonthSelector && (
              <div className="absolute right-0 z-10 mt-1 w-60 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                <div className="max-h-60 overflow-y-auto">
                  {monthOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        selectedMonth === option.value
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedMonth(option.value);
                        setShowMonthSelector(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product filter */}
          <div className="relative">
            <input
              type="text"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              placeholder="Filter products..."
              className="pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-3">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Units (Target)</p>
              <p className="text-xl font-semibold">
                {formatNumber(summary.total_forecasted || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Units (Actual)</p>
              <p className="text-xl font-semibold">
                {formatNumber(summary.total_actual || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-3">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenue (Target)</p>
              <p className="text-xl font-semibold">
                {formatCurrency(summary.total_forecasted_revenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg p-4 border ${
            (summary.achievement_rate || 0) >= PERFORMANCE_THRESHOLDS.ACHIEVED
              ? "bg-green-50 border-green-100"
              : (summary.achievement_rate || 0) >= PERFORMANCE_THRESHOLDS.NEAR
              ? "bg-yellow-50 border-yellow-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`rounded-full p-2 mr-3 ${
                (summary.achievement_rate || 0) >=
                PERFORMANCE_THRESHOLDS.ACHIEVED
                  ? "bg-green-100"
                  : (summary.achievement_rate || 0) >=
                    PERFORMANCE_THRESHOLDS.NEAR
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              <BarChart2
                className={`h-5 w-5 ${
                  (summary.achievement_rate || 0) >=
                  PERFORMANCE_THRESHOLDS.ACHIEVED
                    ? "text-green-600"
                    : (summary.achievement_rate || 0) >=
                      PERFORMANCE_THRESHOLDS.NEAR
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Achievement Rate</p>
              <p className="text-xl font-semibold">
                {(summary.achievement_rate || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview Chart */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Overall Performance
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredProducts.slice(0, 10)} // Show top 10 products
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="product_name"
                tick={{ fontSize: 12 }}
                height={70}
                angle={-45}
                textAnchor="end"
                interval={0}
                tickFormatter={(value) =>
                  value.length > 20 ? `${value.substring(0, 20)}...` : value
                }
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "forecast") {
                    return [formatNumber(value), "Target"];
                  } else if (name === "actual") {
                    return [formatNumber(value), "Actual"];
                  }
                  return [formatNumber(value), name];
                }}
              />
              <Legend />
              <Bar dataKey="forecast" name="Target" fill="#3b82f6" />
              <Bar dataKey="actual" name="Actual" fill="#10b981" />
              <ReferenceLine y={0} stroke="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top/Under Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-500" size={20} />
            Top Performers
          </h2>
          {summary.top_performers && summary.top_performers.length > 0 ? (
            <div className="space-y-3">
              {summary.top_performers.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-semibold text-xl">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium" title={product.product_name}>
                      {product.product_name.length > 30
                        ? `${product.product_name.substring(0, 30)}...`
                        : product.product_name}
                    </h3>
                    <div className="text-sm text-gray-600 flex justify-between mt-1">
                      <span>
                        Achievement:{" "}
                        <span className="font-semibold text-green-600">
                          {product.achievement_rate.toFixed(1)}%
                        </span>
                      </span>
                      {product.variance >= 0 ? (
                        <span>
                          <TrendingUp
                            size={14}
                            className="inline mr-1 text-green-600"
                          />
                          {formatNumber(product.variance)} units above target
                        </span>
                      ) : (
                        <span>
                          <TrendingUp
                            size={14}
                            className="inline mr-1 text-green-600"
                          />
                          {formatNumber(product.actual)} of{" "}
                          {formatNumber(product.forecast)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No top performers found
            </div>
          )}
        </div>

        {/* Under Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <TrendingDown className="mr-2 text-red-500" size={20} />
            Underperforming Products
          </h2>
          {summary.under_performers && summary.under_performers.length > 0 ? (
            <div className="space-y-3">
              {summary.under_performers.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 rounded-full bg-red-100 text-red-700 font-semibold text-xl">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium" title={product.product_name}>
                      {product.product_name.length > 30
                        ? `${product.product_name.substring(0, 30)}...`
                        : product.product_name}
                    </h3>
                    <div className="text-sm text-gray-600 flex justify-between mt-1">
                      <span>
                        Achievement:{" "}
                        <span className="font-semibold text-red-600">
                          {product.achievement_rate.toFixed(1)}%
                        </span>
                      </span>
                      <span>
                        <TrendingDown
                          size={14}
                          className="inline mr-1 text-red-600"
                        />
                        {formatNumber(Math.abs(product.variance))} units below
                        target
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No underperforming products found
            </div>
          )}
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Layers className="mr-2 text-gray-500" size={20} />
          Products Performance
        </h2>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Target
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actual
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Variance
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Achievement
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <React.Fragment key={product.product_id}>
                    <tr className="hover:bg-gray-50">
                      <td
                        className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        title={product.product_name}
                      >
                        {product.product_name.length > 40
                          ? `${product.product_name.substring(0, 40)}...`
                          : product.product_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatNumber(product.forecast)} {product.unit}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatNumber(product.actual)} {product.unit}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        <span
                          className={
                            product.variance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {product.variance >= 0 ? "+" : ""}
                          {formatNumber(product.variance)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <span
                          className={
                            product.achievement_rate >=
                            PERFORMANCE_THRESHOLDS.ACHIEVED
                              ? "text-green-600"
                              : product.achievement_rate >=
                                PERFORMANCE_THRESHOLDS.NEAR
                              ? "text-yellow-600"
                              : "text-red-600"
                          }
                        >
                          {product.achievement_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        {getPerformanceBadge(product.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() =>
                            toggleProductExpand(product.product_id)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedProduct === product.product_id ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedProduct === product.product_id && (
                      <tr>
                        <td colSpan="7" className="px-4 py-4 bg-gray-50">
                          <div className="p-3">
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                              <BarChart2
                                className="mr-2 text-blue-500"
                                size={18}
                              />
                              Performance Trends for {product.product_name}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xs text-gray-600">
                                  Revenue (Target)
                                </p>
                                <p className="text-lg font-semibold">
                                  {formatCurrency(product.forecast_revenue)}
                                </p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <p className="text-xs text-gray-600">
                                  Revenue (Actual)
                                </p>
                                <p className="text-lg font-semibold">
                                  {formatCurrency(product.actual_revenue)}
                                </p>
                              </div>
                              <div
                                className={`p-3 rounded-lg border ${
                                  product.revenue_variance >= 0
                                    ? "bg-green-50 border-green-100"
                                    : "bg-red-50 border-red-100"
                                }`}
                              >
                                <p className="text-xs text-gray-600">
                                  Revenue Variance
                                </p>
                                <p
                                  className={`text-lg font-semibold ${
                                    product.revenue_variance >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {product.revenue_variance >= 0 ? "+" : ""}
                                  {formatCurrency(product.revenue_variance)}
                                </p>
                              </div>
                            </div>

                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={getProductTrendData(product.product_id)}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <Tooltip
                                    formatter={(value, name) => {
                                      if (name === "forecast") {
                                        return [formatNumber(value), "Target"];
                                      } else if (name === "actual") {
                                        return [formatNumber(value), "Actual"];
                                      }
                                      return [formatNumber(value), name];
                                    }}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="ForecastLine"
                                    name="Target"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                    connectNulls={true}
                                    dot={{ strokeWidth: 2 }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="Actual"
                                    name="Actual"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="mt-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <AlertCircle
                                  size={14}
                                  className="mr-1 text-blue-500"
                                />
                                <span>
                                  Historical trend showing monthly sales versus
                                  targets for the past 6 months.
                                  {product.forecast_lower &&
                                  product.forecast_upper
                                    ? ` Target range: ${formatNumber(
                                        product.forecast_lower
                                      )} - ${formatNumber(
                                        product.forecast_upper
                                      )} ${product.unit}`
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products match your filter criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;
