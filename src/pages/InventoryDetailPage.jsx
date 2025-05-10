import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Tag,
  Truck,
  ChevronLeft,
  Edit2,
  Download,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Calendar,
  Clipboard,
  Layers,
  AlertTriangle,
  Users,
  User,
  BarChart2,
  Activity,
  PieChart as PieChartIcon,
  BookOpen,
  Clock,
  TrendingDown,
  Zap,
  Target,
  Calendar as CalendarIcon,
  Percent,
  ShoppingCart,
  CheckCircle,
  Info,
  XCircle,
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
  AreaChart,
  Area,
  ReferenceLine,
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const InventoryDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all"); // Default: "all" (changed from 12 months)
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "sales", "customers", "predictions"

  useEffect(() => {
    // Automatically set timeRange to "all" when entering the Inventory Metrics tab
    if (activeTab === "inventory") {
      setTimeRange("all");
    }
  }, [activeTab]);

  // Fetch product details and sales data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Fetch product details
        const productResponse = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/inventory/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!productResponse.ok) {
          throw new Error("Failed to fetch product details");
        }

        const productData = await productResponse.json();

        // Determine months value for API call
        // Convert "all" to a large number (e.g., 9999) for API
        const monthsValue = timeRange === "all" ? 9999 : parseInt(timeRange);

        // Fetch sales data with updated time range
        const salesResponse = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/inventory/${productId}/sales?months=${monthsValue}`,
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

        setProduct(productData.data);
        setSalesData(salesData.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, timeRange]);

  // Handle back navigation
  const goBack = () => {
    navigate("/inventory");
  };

  // Number formatter for currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format large numbers
  const formatNumber = (value) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Format percentage
  const formatPercent = (value) => {
    if (value === undefined || value === null) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  // Create colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];

  // Calculate sales velocity (units sold per month on average)
  const calculateSalesVelocity = () => {
    if (
      !salesData ||
      !salesData.sales_by_month ||
      salesData.sales_by_month.length === 0
    ) {
      return { velocity: 0, trend: 0 };
    }

    const monthsCount = salesData.sales_by_month.length;
    const totalQty = salesData.total_qty;

    // Calculate velocity
    const velocity = totalQty / monthsCount;

    // Calculate trend (comparing first half to second half if enough data)
    let trend = 0;
    if (monthsCount >= 4) {
      const midpoint = Math.floor(monthsCount / 2);
      const firstHalfMonths = salesData.sales_by_month.slice(0, midpoint);
      const secondHalfMonths = salesData.sales_by_month.slice(midpoint);

      const firstHalfAvg =
        firstHalfMonths.reduce((sum, month) => sum + month.amount, 0) /
        firstHalfMonths.length;
      const secondHalfAvg =
        secondHalfMonths.reduce((sum, month) => sum + month.amount, 0) /
        secondHalfMonths.length;

      if (firstHalfAvg > 0) {
        trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      }
    }

    return { velocity: Math.floor(velocity), trend: trend };
  };

  // Calculate stock turnover rate (how many times the inventory turns over in a year)
  // First, let's fix the calculateStockTurnover and calculateDaysInventory functions:

  // Calculate stock turnover rate (how many times the inventory turns over in a year)
  const calculateStockTurnover = () => {
    if (!product || !salesData || product.qty === 0) {
      return 0;
    }

    // For "all" time range, calculate annualized sales using 12-month data or total months
    let annualSalesQty;
    if (timeRange === "all") {
      // If we have sales_by_month data, determine the actual time span in months
      if (salesData.sales_by_month && salesData.sales_by_month.length > 0) {
        const monthCount = salesData.sales_by_month.length;
        // If we have enough months to make a good calculation
        if (monthCount > 0) {
          // Annualize by converting total sales to a yearly equivalent
          annualSalesQty = (salesData.total_qty / monthCount) * 12;
        } else {
          // Fallback if month count is invalid
          annualSalesQty = salesData.total_qty;
        }
      } else {
        // If no monthly data, use total_qty directly (assuming it's annual already)
        annualSalesQty = salesData.total_qty;
      }
    } else {
      // For specific time ranges (3, 6, 12 months)
      const months = parseInt(timeRange);
      annualSalesQty = (salesData.total_qty / months) * 12;
    }

    const turnoverRate = annualSalesQty / product.qty;
    return turnoverRate;
  };

  // Calculate days inventory outstanding (average number of days to sell the inventory)
  const calculateDaysInventory = () => {
    const turnover = calculateStockTurnover();
    if (turnover === 0) return 0;

    return Math.round(365 / turnover);
  };

  // Prepare data for quarterly sales analysis
  const prepareQuarterlySales = () => {
    if (
      !salesData ||
      !salesData.sales_by_month ||
      salesData.sales_by_month.length < 3
    ) {
      return [];
    }

    // Group months into quarters
    const quarterMap = {
      Jan: "Q1",
      Feb: "Q1",
      Mar: "Q1",
      Apr: "Q2",
      May: "Q2",
      Jun: "Q2",
      Jul: "Q3",
      Aug: "Q3",
      Sep: "Q3",
      Oct: "Q4",
      Nov: "Q4",
      Dec: "Q4",
    };

    // Initialize quarters
    const quarters = {};

    // Process each month
    salesData.sales_by_month.forEach((month) => {
      // Extract month name and year
      const [monthName, year] = month.month.split(" ");
      const quarter = `${quarterMap[monthName]} ${year}`;

      if (!quarters[quarter]) {
        quarters[quarter] = {
          quarter: quarter,
          amount: 0,
          count: 0,
        };
      }

      quarters[quarter].amount += month.amount;
      quarters[quarter].count += 1;
    });

    // Convert to array and sort by quarter
    return Object.values(quarters)
      .map((q) => ({
        quarter: q.quarter,
        amount: q.amount,
      }))
      .sort((a, b) => {
        const [aQ, aY] = a.quarter.split(" ");
        const [bQ, bY] = b.quarter.split(" ");

        if (aY !== bY) return parseInt(aY) - parseInt(bY);
        return aQ.localeCompare(bQ);
      });
  };

  // Prepare profitability and margin data for analysis
  const prepareProfitabilityData = () => {
    if (!salesData || !salesData.sales_by_month) return [];

    // For proper calculation, we need cost data from the backend
    // This assumes your API now returns cost_by_month alongside sales_by_month
    if (
      salesData.cost_by_month &&
      salesData.cost_by_month.length === salesData.sales_by_month.length
    ) {
      // Use actual cost data if available
      return salesData.sales_by_month.map((month, index) => {
        const costData = salesData.cost_by_month[index];
        const revenue = month.amount;
        const cost = costData.amount;
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          name: month.month,
          revenue: revenue,
          cost: cost,
          profit: profit,
          margin: margin,
        };
      });
    } else {
      // If backend doesn't provide cost_by_month yet,
      // Still use more varied calculations by incorporating transaction counts
      // as a way to simulate variable costs
      return salesData.sales_by_month.map((month) => {
        // Calculate a more varied cost estimate using order count as a factor
        const orderCount = month.order_count || 1;
        const variabilityFactor = 0.05 * (Math.random() - 0.5); // +/- 5% variability

        // Base margin plus some variability based on volume
        const effectiveMargin =
          (salesData.profit_margin || 20) +
          (orderCount > 5 ? 2 : -1) + // Higher volume, slightly better margin
          variabilityFactor * 100; // Random variability

        const calculatedCost = month.amount * (1 - effectiveMargin / 100);

        return {
          name: month.month,
          revenue: month.amount,
          cost: calculatedCost,
          profit: month.amount - calculatedCost,
          margin: effectiveMargin,
        };
      });
    }
  };

  // Calculate seasonal pattern if enough data
  const calculateSeasonalPattern = () => {
    if (
      !salesData ||
      !salesData.sales_by_month ||
      salesData.sales_by_month.length < 6
    ) {
      return null;
    }

    // Extract month names
    const monthsData = salesData.sales_by_month.map((entry) => {
      const monthName = entry.month.split(" ")[0];
      return {
        month: monthName,
        amount: entry.amount,
      };
    });

    // Aggregate by month
    const monthAggregates = {};
    monthsData.forEach((data) => {
      if (!monthAggregates[data.month]) {
        monthAggregates[data.month] = {
          month: data.month,
          total: 0,
          count: 0,
        };
      }

      monthAggregates[data.month].total += data.amount;
      monthAggregates[data.month].count += 1;
    });

    // Calculate averages
    const monthAverages = Object.values(monthAggregates).map((data) => ({
      month: data.month,
      average: data.total / data.count,
    }));

    // Sort by month order
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    monthAverages.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    );

    return monthAverages;
  };

  // Generate radar chart data for key performance metrics
  // const generateRadarData = () => {
  //   if (!salesData) return [];

  //   const turnoverRate = calculateStockTurnover();
  //   const daysInventory = calculateDaysInventory();
  //   const { velocity, trend } = calculateSalesVelocity();

  //   // Create normalized values on a scale of 0-100
  //   return [
  //     {
  //       subject: "Sales Volume",
  //       A: Math.min(Math.max((salesData.total_qty || 0) / 100, 0), 100),
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Revenue",
  //       A: Math.min(Math.max((salesData.total_sales || 0) / 10000000, 0), 100),
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Profit Margin",
  //       A: Math.min(Math.max(salesData.profit_margin || 0, 0), 100),
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Turnover Rate",
  //       A: Math.min(Math.max(turnoverRate * 10, 0), 100),
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Sales Velocity",
  //       A: Math.min(Math.max(velocity * 2, 0), 100),
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Growth Trend",
  //       A: Math.min(Math.max(trend + 50, 0), 100), // Normalize -50% to +50% → 0 to 100
  //       fullMark: 100,
  //     },
  //   ];
  // };

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
          <p className="font-medium">Error loading product data</p>
        </div>
        <p className="mb-4">{error}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/inventory")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center"
          >
            <ChevronLeft className="mr-2" size={16} /> Back to Inventory
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

  // If product data exists but no sales data
  if (!salesData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={goBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Inventory
        </button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {product?.product_name}
            </h1>
            <p className="text-gray-500 text-sm">
              Product ID: {product?.product_id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition"
              title="Edit Product"
            >
              <Edit2 className="mr-2" size={18} /> Edit
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-500 mr-2" size={20} />
            <p className="text-yellow-700">
              No sales data available for this product.
            </p>
          </div>
        </div>

        {/* Product Details Card */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-3">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Tag size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Product ID</p>
                <p className="font-medium">{product?.product_id}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Layers size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">
                  {product?.category || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <DollarSign size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Standard Price</p>
                <p className="font-medium">
                  {formatCurrency(product?.standard_price)}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <DollarSign size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Retail Price</p>
                <p className="font-medium">
                  {formatCurrency(product?.retail_price)}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-yellow-100 p-2 mr-3">
                <Clipboard size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock Level</p>
                <p className="font-medium flex items-center">
                  <span>
                    {product?.qty} {product?.unit}
                  </span>
                  {product?.qty <= product?.min_stock && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      Low Stock
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-red-100 p-2 mr-3">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Minimum Stock</p>
                <p className="font-medium">
                  {product?.min_stock} {product?.unit}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Truck size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">
                  {product?.supplier_name || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Package size={16} className="text-blue-600" />
              </div>
              {/* <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {product?.location || "Not specified"}
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate additional metrics
  const { velocity, trend } = calculateSalesVelocity();
  // const turnoverRate = calculateStockTurnover();
  const daysInventory = calculateDaysInventory();
  const quarterlySales = prepareQuarterlySales();
  const profitabilityData = prepareProfitabilityData();
  const seasonalPattern = calculateSeasonalPattern();
  // const radarData = generateRadarData();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <button
        onClick={goBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to Inventory
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {product?.product_name}
          </h1>
          <p className="text-gray-500 text-sm">
            Product ID: {product?.product_id}
          </p>
        </div>
      </div>

      {/* Stock Status Alert if needed */}
      {product?.qty <= product?.min_stock && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">
              This product is currently below the minimum stock level (
              {product.min_stock} {product.unit}). Consider restocking soon.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Sales Overview
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sales"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("sales")}
          >
            Detailed Analysis
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "customers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("customers")}
          >
            Customer Insights
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "inventory"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            Product Profile
          </button>
        </nav>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100 rounded-md inline-flex p-1">
          {["3", "6", "12", "all"].map((months) => (
            <button
              key={months}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === months
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setTimeRange(months)}
              disabled={activeTab === "inventory"} // Disable when on inventory tab
              style={{
                opacity:
                  activeTab === "inventory" && months !== "all" ? 0.5 : 1,
              }}
            >
              {months === "all" ? "All Time" : `${months} Months`}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  <Package size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Units Sold</p>
                  <p className="text-xl font-semibold">
                    {formatNumber(salesData.total_qty)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-md p-4 border border-purple-100">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-2 mr-3">
                  <Percent size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-xl font-semibold">
                    {salesData.profit_margin
                      ? `${salesData.profit_margin.toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-md p-4 border border-yellow-100">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-2 mr-3">
                  <Zap size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sales Velocity</p>
                  <p className="text-xl font-semibold">
                    {formatNumber(velocity)} / month
                  </p>
                  <span
                    className={`text-xs ${
                      trend >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Trend Chart - Updated version with trend line */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    const data = [...salesData.sales_by_month];
                    // Calculate trend line using linear regression
                    let sumX = 0,
                      sumY = 0,
                      sumXY = 0,
                      sumX2 = 0;
                    const n = data.length;

                    data.forEach((item, index) => {
                      const x = index + 1;
                      const y = item.amount;
                      sumX += x;
                      sumY += y;
                      sumXY += x * y;
                      sumX2 += x * x;
                    });

                    const slope =
                      (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                    const intercept = (sumY - slope * sumX) / n;

                    return data.map((item, index) => ({
                      ...item,
                      trend: slope * (index + 1) + intercept,
                    }));
                  })()}
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
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const actual = payload.find((p) => p.name === "Sales");
                        if (!actual) return null;

                        return (
                          <div className="bg-white border rounded shadow p-2 text-sm">
                            <div className="font-semibold">Period: {label}</div>
                            <div className="text-blue-600">
                              {actual.name}: {formatCurrency(actual.value)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    name="Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="Trend Line"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two-column layout for Top Customers and Product Info + Recent Transactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Customers with Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-4">Top 8 Customers</h2>

              {salesData.top_customers && salesData.top_customers.length > 0 ? (
                <>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesData.top_customers}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total_amount"
                          nameKey="business_name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {salesData.top_customers.map((entry, index) => (
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
                          <th className="text-left p-2">Top Customers</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.top_customers.map((customer, index) => (
                          <tr key={index} className="border-t border-gray-100">
                            <td className="p-2">
                              <div className="flex items-center">
                                <div
                                  className="w-2 h-2 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                ></div>
                                {customer.business_name}
                              </div>
                            </td>
                            <td className="p-2 text-right">
                              {formatNumber(customer.qty)}
                            </td>
                            <td className="p-2 text-right font-medium">
                              {formatCurrency(customer.total_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p>No customer data available</p>
                </div>
              )}
            </div>

            {/* Product Info and Recent Transactions in a single column */}
            <div className="flex flex-col gap-6">
              {/* Product Information Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-semibold mb-3">
                  Product Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <Tag size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Product ID</p>
                      <p className="font-medium">{product?.product_id}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <Layers size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">
                        {product?.category || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <DollarSign size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Standard Price</p>
                      <p className="font-medium">
                        {formatCurrency(product?.standard_price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-purple-100 p-2 mr-3">
                      <DollarSign size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Retail Price</p>
                      <p className="font-medium">
                        {formatCurrency(product?.retail_price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-yellow-100 p-2 mr-3">
                      <Clipboard size={16} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stock Level</p>
                      <p className="font-medium flex items-center">
                        <span>
                          {product?.qty} {product?.unit}
                        </span>
                        {product?.qty <= product?.min_stock && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            Low Stock
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-red-100 p-2 mr-3">
                      <AlertTriangle size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Minimum Stock</p>
                      <p className="font-medium">
                        {product?.min_stock} {product?.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex-grow">
                <h2 className="text-lg font-semibold mb-3">
                  Recent Transactions
                </h2>

                {salesData.recent_transactions &&
                salesData.recent_transactions.length > 0 ? (
                  <div className="overflow-y-auto max-h-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Invoice</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Customer</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.recent_transactions.map(
                          (transaction, index) => (
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
                              <td className="p-2">
                                <div className="flex items-center">
                                  <User
                                    size={12}
                                    className="mr-1 text-gray-400"
                                  />
                                  {transaction.customer_name || "Unknown"}
                                </div>
                              </td>
                              <td className="p-2 text-right">
                                {formatNumber(transaction.qty)}
                              </td>
                              <td className="p-2 text-right">
                                {formatCurrency(transaction.total_amount)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p>No recent transactions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* DETAILED SALES ANALYSIS TAB */}
      {activeTab === "sales" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div
              className="bg-indigo-50 rounded-md p-4 border border-indigo-100"
              title="Year-to-Date growth compared to same period last year"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-indigo-100 p-2 mr-3">
                  <Activity size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">YTD Growth</p>
                  <p className="text-xl font-semibold flex items-center">
                    {salesData.ytd_growth
                      ? `${formatPercent(salesData.ytd_growth)}`
                      : "N/A"}
                    {salesData.ytd_growth && (
                      <span
                        className={`ml-2 text-xs ${
                          salesData.ytd_growth >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {salesData.ytd_growth >= 0 ? "↑" : "↓"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="bg-teal-50 rounded-md p-4 border border-teal-100"
              title="Total sales from January 1st to today"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-teal-100 p-2 mr-3">
                  <CalendarIcon size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Year (YTD)</p>
                  <p className="text-xl font-semibold">
                    {salesData.this_ytd_sales
                      ? formatCurrency(salesData.this_ytd_sales)
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="bg-amber-50 rounded-md p-4 border border-amber-100"
              title="Same period last year for comparison"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-2 mr-3">
                  <CalendarIcon size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Previous Year (YTD)</p>
                  <p className="text-xl font-semibold">
                    {salesData.previous_ytd_sales
                      ? formatCurrency(salesData.previous_ytd_sales)
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="bg-emerald-50 rounded-md p-4 border border-emerald-100"
              title="Current month performance"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-emerald-100 p-2 mr-3">
                  <CalendarIcon size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month Sales</p>
                  <p className="text-xl font-semibold">
                    {salesData.this_month_sales
                      ? formatCurrency(salesData.this_month_sales)
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quarterly Sales Analysis */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4">
                Quarterly Sales Analysis
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={quarterlySales}
                    margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Sales"]}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Quarterly Sales"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Profitability Analysis */}
          <div className="grid grid-cols-1 gap-6 mb-1">
            {/* Profit Margin Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Profit Performance & Margin
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={profitabilityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                        }).format(value)
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 50]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const revenue =
                            payload.find((p) => p.name === "Revenue")?.value ||
                            0;
                          const cost =
                            payload.find((p) => p.name === "Cost")?.value || 0;
                          const profit =
                            payload.find((p) => p.name === "Profit")?.value ||
                            0;
                          const margin =
                            payload.find((p) => p.name === "Profit Margin")
                              ?.value || 0;

                          return (
                            <div className="bg-white border rounded shadow-lg p-4 text-sm">
                              <div className="font-bold text-gray-800 border-b pb-2 mb-2">
                                {label}
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Revenue:
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    {formatCurrency(revenue)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Cost:</span>
                                  <span className="font-medium text-red-600">
                                    {formatCurrency(cost)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Profit:</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(profit)}
                                  </span>
                                </div>
                                <div className="flex justify-between bg-gray-50 p-1 rounded mt-2">
                                  <span className="text-gray-600">Margin:</span>
                                  <span className="font-bold text-purple-600">
                                    {margin.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      fill="#93c5fd"
                      stroke="#3b82f6"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="cost"
                      fill="#fca5a5"
                      stroke="#ef4444"
                      fillOpacity={0.3}
                      name="Cost"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="profit"
                      fill="#10b981"
                      name="Profit"
                      barSize={20}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="margin"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      name="Profit Margin"
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Revenue and cost shown as areas, profit as bars, and margin as a
                line (right axis)
              </p>
            </div>
          </div>

          {/* Seasonal Analysis */}
          {seasonalPattern && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Seasonal Sales Pattern
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={seasonalPattern}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Avg. Monthly Sales",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="average"
                      name="Average Monthly Sales"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Shows average sales for each month across all available data
              </p>
            </div>
          )}

          {/* Monthly Trend Analysis with Year-over-Year Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Year-over-Year Comparison
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    // Create comparison data for current year vs previous year
                    const currentYear = new Date().getFullYear();
                    const months = [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ];
                    const comparisonData = [];

                    const currentYearData = {};
                    const previousYearData = {};

                    salesData.sales_by_month.forEach((item) => {
                      const [month, year] = item.month.split(" ");
                      if (year === currentYear.toString()) {
                        currentYearData[month] = item.amount;
                      } else if (year === (currentYear - 1).toString()) {
                        previousYearData[month] = item.amount;
                      }
                    });

                    months.forEach((month) => {
                      comparisonData.push({
                        month,
                        currentYear: currentYearData[month] || 0,
                        previousYear: previousYearData[month] || 0,
                      });
                    });

                    return comparisonData;
                  })()}
                  margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("id-ID", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      // Determine the year based on the data key
                      const year =
                        name === "currentYear"
                          ? new Date().getFullYear()
                          : new Date().getFullYear() - 1;

                      return [formatCurrency(value), `${year}`];
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const currentYear = new Date().getFullYear();
                        return (
                          <div className="bg-white border rounded shadow p-3 text-sm">
                            <div className="font-semibold mb-1">{label}</div>
                            {payload.map((entry, index) => (
                              <div
                                key={index}
                                style={{ color: entry.color }}
                                className="mb-1"
                              >
                                {entry.dataKey === "currentYear"
                                  ? `${currentYear}: ${formatCurrency(
                                      entry.value
                                    )}`
                                  : `${currentYear - 1}: ${formatCurrency(
                                      entry.value
                                    )}`}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="currentYear"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name={new Date().getFullYear()}
                  />
                  <Line
                    type="monotone"
                    dataKey="previousYear"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    name={new Date().getFullYear() - 1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Sales Area Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-4">Monthly Sales</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesData.sales_by_month}
                  margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("id-ID", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "amount") {
                        return [formatCurrency(value), "Sales"];
                      }
                      return [value, name];
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border rounded shadow p-3 text-sm">
                            <div className="font-semibold mb-1">{label}</div>
                            <div className="text-blue-600 mb-1">
                              Sales: {formatCurrency(payload[0].value)}
                            </div>
                            <div className="text-gray-700 mb-1">
                              Orders:{" "}
                              {formatNumber(
                                payload[0].payload.order_count || 0
                              )}
                            </div>
                            <div className="text-gray-700">
                              Qty: {formatNumber(payload[0].payload.qty || 0)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Monthly Sales"
                  />
                  <ReferenceLine
                    y={
                      salesData.sales_by_month.reduce(
                        (acc, cur) => acc + cur.amount,
                        0
                      ) / salesData.sales_by_month.length
                    }
                    stroke="#ff7300"
                    strokeDasharray="3 3"
                    label={{
                      value: "Average",
                      position: "insideBottomRight",
                      fontSize: 10,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* CUSTOMER INSIGHTS TAB */}
      {activeTab === "customers" && (
        <>
          {/* Metric Cards */}
          {salesData.all_customers && salesData.all_customers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-xl font-semibold">
                      {salesData.all_customers
                        ? formatNumber(salesData.all_customers.length)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-md p-4 border border-green-100">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <User size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Avg Qty Per Customer
                    </p>
                    <p className="text-xl font-semibold">
                      {salesData.all_customers &&
                      salesData.all_customers.length > 0
                        ? formatNumber(
                            Math.floor(
                              salesData.total_qty /
                                salesData.all_customers.length
                            )
                          )
                        : 0}{" "}
                      units
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-md p-4 border border-purple-100">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 p-2 mr-3">
                    <ShoppingCart size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Qty Per Invoice</p>
                    <p className="text-xl font-semibold">
                      {salesData.avg_qty_per_invoice !== undefined
                        ? formatNumber(
                            Math.floor(salesData.avg_qty_per_invoice)
                          )
                        : 0}{" "}
                      units
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Concentration */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Customer Purchase Distribution
            </h2>

            {salesData.top_customers && salesData.top_customers.length > 0 ? (
              <>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData.top_customers}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total_amount"
                        nameKey="business_name"
                        label={({ name, percent }) =>
                          `${
                            name.length > 15
                              ? name.substring(0, 15) + "..."
                              : name
                          }: ${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {salesData.top_customers.map((entry, index) => (
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

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Key Insights
                    </h3>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-600">
                    {salesData.top_customers.length > 0 && (
                      <li className="flex items-start">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0"
                          style={{ backgroundColor: COLORS[0] }}
                        ></div>
                        <span>
                          <strong>
                            {salesData.top_customers[0].business_name}
                          </strong>{" "}
                          is the top customer, representing
                          <strong>
                            {" "}
                            {(
                              (salesData.top_customers[0].total_amount /
                                salesData.total_sales) *
                              100
                            ).toFixed(1)}
                            %
                          </strong>
                          of this product's sales.
                        </span>
                      </li>
                    )}
                    {salesData.top_customers.length > 2 && (
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-blue-500"></div>
                        <span>
                          The top 3 customers account for
                          <strong>
                            {" "}
                            {(
                              (salesData.top_customers
                                .slice(0, 3)
                                .reduce((sum, c) => sum + c.total_amount, 0) /
                                salesData.total_sales) *
                              100
                            ).toFixed(1)}
                            %
                          </strong>{" "}
                          of sales.
                        </span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-green-500"></div>
                      <span>
                        <strong> {salesData.all_customers.length}</strong>{" "}
                        customers purchased this product
                      </span>
                    </li>
                    {salesData.avg_qty_per_invoice !== undefined && (
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-purple-500"></div>
                        <span>
                          Average purchase quantity per invoice is
                          <strong>
                            {" "}
                            {formatNumber(
                              Math.floor(salesData.avg_qty_per_invoice)
                            )}
                          </strong>{" "}
                          units.
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Users size={48} className="mb-4 opacity-20" />
                <p>No customer data available</p>
              </div>
            )}
          </div>

          {/* Customer Purchase Table - Shows all customers */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                All Customer Purchase Data
              </h2>
              <div className="text-sm text-gray-500">
                {salesData.all_customers ? salesData.all_customers.length : 0}{" "}
                customers total
              </div>
            </div>

            {salesData.all_customers && salesData.all_customers.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Units
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Sales
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % of Total
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Price/Unit
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Purchase
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesData.all_customers.map((customer, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    index < 8
                                      ? COLORS[index % COLORS.length]
                                      : "#aaaaaa",
                                }}
                              ></div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer.business_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            {formatNumber(customer.qty)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            {formatCurrency(customer.total_amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            {(
                              (customer.total_amount / salesData.total_sales) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            {formatCurrency(
                              customer.total_amount / customer.qty
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                            {customer.last_purchase
                              ? new Date(
                                  customer.last_purchase
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <Users size={32} className="mb-3 opacity-20" />
                <p>No customer purchase data available</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* INVENTORY METRICS TAB */}
      {activeTab === "inventory" && (
        <>
          {/* Key Inventory Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="bg-blue-50 rounded-md p-4 border border-blue-100 relative group"
              title="Current inventory quantity available in stock"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Clipboard size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="text-xl font-semibold">
                    {formatNumber(product?.qty)} {product?.unit}
                  </p>
                  <p
                    className={`text-xs ${
                      product?.qty <= product?.min_stock
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {product?.qty <= product?.min_stock
                      ? "Below minimum stock level"
                      : "Sufficient stock"}
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="bg-green-50 rounded-md p-4 border border-green-100 relative group">
              <div
                className="flex items-center"
                title="How many times your inventory is sold and replaced during a
                year. Higher values indicate more efficient inventory
                management."
              >
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <RefreshCw size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Turnover Rate</p>
                  <p className="text-xl font-semibold">
                    {turnoverRate.toFixed(1)}x{" "}
                    <span className="text-xs text-gray-500">per year</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    {turnoverRate < 3
                      ? "Low"
                      : turnoverRate < 6
                      ? "Average"
                      : "High"}{" "}
                    turnover
                  </p>
                </div>
              </div>
            </div> */}
            <div className="bg-yellow-50 rounded-md p-4 border border-yellow-100 relative group">
              <div
                className="flex items-center"
                title="Average number of days it takes to sell through current
                inventory. Lower values indicate faster-moving products."
              >
                <div className="rounded-full bg-yellow-100 p-2 mr-3">
                  <Clock size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Inventory</p>
                  <p className="text-xl font-semibold">
                    {daysInventory}{" "}
                    <span className="text-xs text-gray-500">days</span>
                  </p>
                  {/* <p className="text-xs text-gray-600">
                    {daysInventory < 30
                      ? "Fast-moving"
                      : daysInventory < 90
                      ? "Normal"
                      : "Slow-moving"}
                  </p> */}
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-md p-4 border border-purple-100 relative group">
              <div
                className="flex items-center"
                title={`Recommended minimum and maximum stock levels.${
                  product?.use_forecast ? " Based on sales forecast data." : ""
                }`}
              >
                <div className="rounded-full bg-purple-100 p-2 mr-3">
                  <Target size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Levels</p>
                  <p className="text-xl font-semibold">
                    <span
                      className={
                        product?.qty <= product?.min_stock ? "text-red-600" : ""
                      }
                    >
                      {formatNumber(product?.min_stock)} -{" "}
                      {formatNumber(product?.max_stock)}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Min-Max targets{" "}
                    {product?.use_forecast ? "(using forecast)" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Levels & Forecasting */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="mr-2 text-gray-700" size={20} />
              Stock Levels & Forecasting
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Stock Level Settings */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <AlertTriangle className="mr-2 text-amber-500" size={18} />
                  Stock Level Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Stock:</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(product?.qty)} {product?.unit}
                    </p>
                  </div>
                  <div>
                    {/* <p className="text-sm text-gray-500 mb-1">Location:</p>
                    <p className="text-lg font-semibold">
                      {product?.location || "Not specified"}
                    </p> */}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Minimum Stock Level:
                    </p>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold">
                        {formatNumber(product?.min_stock)} {product?.unit}
                      </p>
                      {product?.use_forecast && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          Forecast
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Maximum Stock Level:
                    </p>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold">
                        {formatNumber(product?.max_stock)} {product?.unit}
                      </p>
                      {product?.use_forecast && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          Forecast
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Forecast Based Limits:
                  </p>
                  <div className="flex items-center">
                    {product?.use_forecast ? (
                      <>
                        <div className="rounded-full bg-green-100 p-1 mr-2">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                        <p className="text-sm">
                          Using forecast data for min/max stock levels
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="rounded-full bg-gray-100 p-1 mr-2">
                          <XCircle size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm">
                          Using fixed min/max stock levels
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <Package className="mr-2 text-indigo-600" size={18} />
                  Stock Status
                </h3>

                {/* Current stock display */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <span className="text-xl font-bold">
                    {formatNumber(product?.qty)} {product?.unit}
                  </span>
                </div>

                {/* New Stock Level Gauge */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Stock Level</span>
                    <span
                      className={`font-medium ${
                        product?.qty < product?.min_stock
                          ? "text-red-600"
                          : product?.qty > product?.max_stock
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {product?.qty < product?.min_stock
                        ? "Low"
                        : product?.qty > product?.max_stock
                        ? "Excess"
                        : "Optimal"}
                    </span>
                  </div>

                  {/* Stock gauge with clear min/max markers */}
                  <div className="relative pt-6 pb-3">
                    {/* Min marker */}
                    <div
                      className="absolute top-0 text-xs text-gray-500"
                      style={{
                        left: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (product?.min_stock /
                              Math.max(product?.max_stock * 1.2, 1)) *
                              100
                          )
                        )}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      Min
                    </div>

                    {/* Max marker */}
                    <div
                      className="absolute top-0 text-xs text-gray-500"
                      style={{
                        left: `${Math.min(
                          95,
                          Math.max(
                            0,
                            (product?.max_stock /
                              Math.max(product?.max_stock * 1.2, 1)) *
                              100
                          )
                        )}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      Max
                    </div>

                    {/* Progress bar background with gradient */}
                    <div className="h-3 w-full bg-gradient-to-r from-red-200 via-green-200 to-blue-200 rounded-full">
                      {/* Min and Max markers */}
                      <div className="relative h-full w-full">
                        <div
                          className="absolute h-5 border-l-2 border-gray-600 top-1/2 transform -translate-y-1/2"
                          style={{
                            left: `${Math.min(
                              100,
                              Math.max(
                                0,
                                (product?.min_stock /
                                  Math.max(product?.max_stock * 1.2, 1)) *
                                  100
                              )
                            )}%`,
                          }}
                        ></div>
                        <div
                          className="absolute h-5 border-l-2 border-gray-600 top-1/2 transform -translate-y-1/2"
                          style={{
                            left: `${Math.min(
                              95,
                              Math.max(
                                0,
                                (product?.max_stock /
                                  Math.max(product?.max_stock * 1.2, 1)) *
                                  100
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Stock indicator dot */}
                    <div
                      className="absolute h-7 w-7 rounded-full bg-white border-4 border-indigo-600 -mt-5"
                      style={{
                        left: `${Math.min(
                          98,
                          Math.max(
                            2,
                            (product?.qty /
                              Math.max(product?.max_stock * 1.2, 1)) *
                              100
                          )
                        )}%`,
                        top: "50%",
                        transform: "translateX(-50%)",
                      }}
                    ></div>

                    {/* Scale labels */}
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0</span>
                      <span>
                        {formatNumber(
                          Math.max(product?.max_stock * 1.2, product?.qty * 1.2)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Assessment */}
                <div
                  className={`p-4 rounded-lg ${
                    product?.qty < product?.min_stock
                      ? "bg-red-50 border border-red-100"
                      : product?.qty > product?.max_stock
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-green-50 border border-green-100"
                  }`}
                >
                  {product?.qty < product?.min_stock ? (
                    <>
                      <h4 className="font-medium flex items-center text-red-700 mb-2">
                        <AlertTriangle size={18} className="mr-2" />
                        Low Stock Alert
                      </h4>
                      <p className="text-sm text-gray-700">
                        Current stock ({formatNumber(product?.qty)}{" "}
                        {product?.unit}) is below minimum level (
                        {formatNumber(product?.min_stock)} {product?.unit}).
                        {/* <span className="block mt-1 font-medium">
                          Recommended action: Order more stock soon.
                        </span> */}
                      </p>
                    </>
                  ) : product?.qty > product?.max_stock ? (
                    <>
                      <h4 className="font-medium flex items-center text-blue-700 mb-2">
                        <Info size={18} className="mr-2" />
                        Excess Stock Notice
                      </h4>
                      <p className="text-sm text-gray-700">
                        Current stock ({formatNumber(product?.qty)}{" "}
                        {product?.unit}) exceeds maximum level (
                        {formatNumber(product?.max_stock)} {product?.unit}).
                        {/* <span className="block mt-1 font-medium">
                          Recommended action: Consider promotional activities.
                        </span> */}
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium flex items-center text-green-700 mb-2">
                        <CheckCircle size={18} className="mr-2" />
                        Optimal Stock Level
                      </h4>
                      <p className="text-sm text-gray-700">
                        Current stock ({formatNumber(product?.qty)}{" "}
                        {product?.unit}) is within the optimal range.
                        {/* <span className="block mt-1 font-medium">
                          No action needed at this time.
                        </span> */}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reorder Recommendations */}
            {/* <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <ShoppingCart className="mr-2 text-blue-600" size={18} />
                Reorder Recommendations
              </h3>

              {product?.qty <= product?.min_stock ? (
                <p className="text-sm">
                  Reorder recommended. Current stock (
                  {formatNumber(product?.qty)} {product?.unit}) is below the
                  minimum threshold ({formatNumber(product?.min_stock)}{" "}
                  {product?.unit}).
                </p>
              ) : (
                <p className="text-sm">
                  No reorder needed at this time. Current stock (
                  {formatNumber(product?.qty)} {product?.unit}) is above the
                  minimum threshold ({formatNumber(product?.min_stock)}{" "}
                  {product?.unit}).
                </p>
              )}
            </div> */}
          </div>

          {/* Additional Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart2 size={18} className="mr-2 text-gray-500" />
              Inventory Performance Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="bg-gray-50 rounded-lg p-4 relative group"
                title="The average number of units sold per month and trend compared
                  to previous periods"
              >
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Activity size={16} className="mr-2 text-blue-500" />
                  Sales Velocity
                </h3>
                <p className="text-xl font-semibold">
                  {formatNumber(velocity)} units/month
                </p>
                <p className="text-sm text-gray-600">
                  {trend >= 0 ? (
                    <span className="text-green-600">
                      ↑ {trend.toFixed(1)}% increasing
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ↓ {Math.abs(trend).toFixed(1)}% decreasing
                    </span>
                  )}
                </p>
              </div>

              <div
                className="bg-gray-50 rounded-lg p-4 relative group"
                title="How long current stock will last at the current rate of sales"
              >
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <AlertCircle size={16} className="mr-2 text-yellow-500" />
                  Stock Coverage
                </h3>
                <p className="text-xl font-semibold">{daysInventory} days</p>
                {/* <p className="text-sm text-gray-600">
                  {daysInventory < 30
                    ? "Very short"
                    : daysInventory < 60
                    ? "Short"
                    : daysInventory < 90
                    ? "Adequate"
                    : daysInventory < 180
                    ? "Long"
                    : "Very long"}{" "}
                  coverage
                </p> */}
              </div>

              <div
                className="bg-gray-50 rounded-lg p-4 relative group"
                title="Lifetime total quantity sold and revenue"
              >
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <PieChartIcon size={16} className="mr-2 text-purple-500" />
                  Total Sales
                </h3>
                <p className="text-xl font-semibold">
                  {formatNumber(salesData?.total_qty || 0)} {product?.unit}
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(salesData?.total_sales || 0)} revenue
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package size={18} className="mr-2 text-gray-500" />
              Product Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Product ID:</span>
                    <span className="font-medium">{product?.product_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Product Code:</span>
                    <span className="font-medium">
                      {product?.product_code || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Category:</span>
                    <span className="font-medium">
                      {product?.category || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Unit:</span>
                    <span className="font-medium">
                      {product?.unit || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">
                  Price Information
                </h3>
                <div className="space-y-3">
                  {/* Calculate Average Sales Price from sales_by_month data */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Average Sales Price:
                    </span>
                    <span className="font-medium text-blue-700">
                      {(() => {
                        if (
                          !salesData?.sales_by_month ||
                          salesData.sales_by_month.length === 0
                        ) {
                          return formatCurrency(product?.standard_price || 0);
                        }

                        const totalAmount = salesData.sales_by_month.reduce(
                          (sum, month) => sum + month.amount,
                          0
                        );
                        const totalQty = salesData.sales_by_month.reduce(
                          (sum, month) => sum + month.qty,
                          0
                        );

                        return totalQty > 0
                          ? formatCurrency(Math.floor(totalAmount / totalQty))
                          : formatCurrency(product?.standard_price || 0);
                      })()}
                    </span>
                  </div>

                  {/* Calculate Average Cost from cost_by_month data */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Average Cost:</span>
                    <span className="font-medium text-red-700">
                      {(() => {
                        if (
                          !salesData?.cost_by_month ||
                          salesData.cost_by_month.length === 0
                        ) {
                          return "N/A";
                        }

                        const totalCost = salesData.cost_by_month.reduce(
                          (sum, month) => sum + month.amount,
                          0
                        );
                        const totalQty = salesData.cost_by_month.reduce(
                          (sum, month) => sum + month.qty,
                          0
                        );

                        return totalQty > 0
                          ? formatCurrency(Math.floor(totalCost / totalQty))
                          : "N/A";
                      })()}
                    </span>
                  </div>

                  {/* Calculate Profit Margin if both price and cost are available */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Profit Margin:
                    </span>
                    <span className="font-medium text-green-700">
                      {(() => {
                        if (
                          !salesData?.sales_by_month ||
                          !salesData?.cost_by_month ||
                          salesData.sales_by_month.length === 0 ||
                          salesData.cost_by_month.length === 0
                        ) {
                          return "N/A";
                        }

                        const totalSales = salesData.sales_by_month.reduce(
                          (sum, month) => sum + month.amount,
                          0
                        );
                        const totalCost = salesData.cost_by_month.reduce(
                          (sum, month) => sum + month.amount,
                          0
                        );

                        if (totalSales > 0 && totalCost > 0) {
                          const margin =
                            ((totalSales - totalCost) / totalSales) * 100;
                          return `${margin.toFixed(1)}%`;
                        }

                        return "N/A";
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Management Recommendations */}
          {/* <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Target size={18} className="mr-2 text-gray-500" />
              Stock Management Recommendations
            </h2>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">
                Insights Based on Analysis
              </h3>

              <ul className="space-y-3">
                {product?.qty <= product?.min_stock && (
                  <li className="flex items-start text-sm">
                    <AlertCircle
                      size={16}
                      className="text-red-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>Restock Required:</strong> Current stock (
                      {product?.qty} {product?.unit}) is below the minimum level
                      ({product?.min_stock} {product?.unit}). Consider placing
                      an order soon.
                    </span>
                  </li>
                )}

                {turnoverRate < 3 && (
                  <li className="flex items-start text-sm">
                    <TrendingDown
                      size={16}
                      className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>Low Turnover Rate:</strong> Your stock turnover
                      rate ({turnoverRate.toFixed(1)}x) is relatively low.
                      Consider reducing order quantities or promotional
                      activities to increase sales velocity.
                    </span>
                  </li>
                )}

                {turnoverRate > 8 && (
                  <li className="flex items-start text-sm">
                    <TrendingUp
                      size={16}
                      className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>High Turnover Rate:</strong> Your stock turnover
                      rate ({turnoverRate.toFixed(1)}x) is excellent. Consider
                      increasing order quantities to maintain stock levels and
                      avoid stockouts.
                    </span>
                  </li>
                )}

                {daysInventory > 180 && (
                  <li className="flex items-start text-sm">
                    <Clock
                      size={16}
                      className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>Slow Moving Inventory:</strong> It takes
                      approximately {daysInventory} days to sell through current
                      stock. This suggests the product may be overstocked
                      relative to its sales velocity.
                    </span>
                  </li>
                )}

                {trend < -15 && (
                  <li className="flex items-start text-sm">
                    <Activity
                      size={16}
                      className="text-red-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>Declining Sales Trend:</strong> Sales have
                      decreased by {Math.abs(trend).toFixed(1)}% compared to
                      previous periods. Review pricing strategy or consider
                      promotional activities.
                    </span>
                  </li>
                )}

                {trend > 15 && (
                  <li className="flex items-start text-sm">
                    <Activity
                      size={16}
                      className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>Growing Sales Trend:</strong> Sales have increased
                      by {trend.toFixed(1)}% compared to previous periods.
                      Consider increasing inventory levels to meet growing
                      demand.
                    </span>
                  </li>
                )}

                {seasonalPattern && seasonalPattern.length > 0 && (
                  <li className="flex items-start text-sm">
                    <CalendarIcon
                      size={16}
                      className="text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>
                      <strong>Seasonal Planning:</strong> Historical data shows{" "}
                      {(() => {
                        const sortedMonths = [...seasonalPattern].sort(
                          (a, b) => b.average - a.average
                        );
                        const topMonth = sortedMonths[0];
                        const bottomMonth =
                          sortedMonths[sortedMonths.length - 1];
                        return `${topMonth.month} has typically been your strongest month, while ${bottomMonth.month} shows lower sales`;
                      })()}
                      . Plan inventory accordingly.
                    </span>
                  </li>
                )}

                {product?.qty > product?.min_stock &&
                  turnoverRate >= 3 &&
                  turnoverRate <= 8 &&
                  daysInventory <= 180 &&
                  trend >= -15 &&
                  trend <= 15 && (
                    <li className="flex items-start text-sm">
                      <CheckCircle
                        size={16}
                        className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        <strong>Optimal Inventory Management:</strong> Current
                        stock levels and turnover rates are within optimal
                        ranges. Continue with your current inventory strategy.
                      </span>
                    </li>
                  )}
              </ul>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
};

export default InventoryDetailPage;
