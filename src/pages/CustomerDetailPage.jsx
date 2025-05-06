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
  Users,
  Package,
  Tag,
  CreditCard,
  Truck,
  PieChart as PieChartIcon,
  BarChart2,
  TrendingDown,
  Calendar as CalendarIcon,
  CheckCircle,
  Percent,
  Award,
  Repeat,
  Archive,
  Filter,
  ShoppingBag,
  Bookmark,
  Heart,
  Zap,
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
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  // State for data
  const [customer, setCustomer] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [timeRange, setTimeRange] = useState("all"); // Default: all (changed from fixed 6 months)
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "analysis", "products", "profile"

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

        // Determine months value for API call
        // Convert "all" to a large number for API
        const monthsValue = timeRange === "all" ? 9999 : parseInt(timeRange);

        // Fetch sales data
        const salesResponse = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/customer/${customerId}/sales?months=${monthsValue}`,
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

  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Create colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Calculate customer purchase frequency (if applicable)
  // const calculatePurchaseFrequency = () => {
  //   if (
  //     !salesData ||
  //     !salesData.recent_transactions ||
  //     salesData.recent_transactions.length < 2
  //   ) {
  //     return "N/A";
  //   }

  //   // Get dates of transactions
  //   const dates = salesData.recent_transactions.map(
  //     (t) => new Date(t.invoice_date)
  //   );
  //   dates.sort((a, b) => a - b);

  //   // Calculate average days between purchases
  //   let totalDays = 0;
  //   for (let i = 1; i < dates.length; i++) {
  //     const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
  //     totalDays += daysDiff;
  //   }

  //   const avgDays = totalDays / (dates.length - 1);

  //   if (avgDays < 7) {
  //     return "Weekly";
  //   } else if (avgDays < 15) {
  //     return "Bi-weekly";
  //   } else if (avgDays < 40) {
  //     return "Monthly";
  //   } else if (avgDays < 100) {
  //     return "Quarterly";
  //   } else {
  //     return "Occasional";
  //   }
  // };

  // Calculate customer loyalty score (simplified)
  // const calculateLoyaltyScore = () => {
  //   if (!salesData) return 0;

  //   // Factors for score: order frequency, total spent, product variety
  //   const totalSpent = salesData.total_sales || 0;
  //   const orderCount = salesData.total_orders || 0;
  //   const productVariety = salesData.top_products
  //     ? salesData.top_products.length
  //     : 0;

  //   // Compute a score out of 100
  //   let score = 0;

  //   // Spend factor (up to 40 points)
  //   if (totalSpent > 500000000) score += 40;
  //   else if (totalSpent > 100000000) score += 30;
  //   else if (totalSpent > 50000000) score += 20;
  //   else if (totalSpent > 10000000) score += 10;
  //   else score += Math.min(40, totalSpent / 250000);

  //   // Order frequency (up to 40 points)
  //   if (orderCount > 50) score += 40;
  //   else if (orderCount > 20) score += 30;
  //   else if (orderCount > 10) score += 20;
  //   else if (orderCount > 5) score += 10;
  //   else score += orderCount * 2;

  //   // Product variety (up to 20 points)
  //   if (productVariety > 15) score += 20;
  //   else if (productVariety > 10) score += 15;
  //   else if (productVariety > 5) score += 10;
  //   else score += productVariety * 2;

  //   return Math.min(100, Math.round(score));
  // };

  // Calculate purchase trend
  const calculatePurchaseTrend = () => {
    if (
      !salesData ||
      !salesData.sales_by_month ||
      salesData.sales_by_month.length < 3
    ) {
      return { trend: 0, description: "Stable" };
    }

    const months = salesData.sales_by_month;

    // Get the first and second half of available data
    const midpoint = Math.floor(months.length / 2);
    const firstHalf = months.slice(0, midpoint);
    const secondHalf = months.slice(midpoint);

    // Calculate averages
    const firstHalfAvg =
      firstHalf.reduce((sum, m) => sum + m.amount, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, m) => sum + m.amount, 0) / secondHalf.length;

    // Calculate percentage change
    let percentChange = 0;
    if (firstHalfAvg > 0) {
      percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    }

    // Determine trend description
    let description = "Stable";
    if (percentChange > 30) description = "Growing rapidly";
    else if (percentChange > 10) description = "Growing";
    else if (percentChange < -30) description = "Declining rapidly";
    else if (percentChange < -10) description = "Declining";

    return { trend: percentChange, description };
  };

  // Calculate customer segment based on RFM (Recency, Frequency, Monetary)®
  // const calculateCustomerSegment = () => {
  //   if (
  //     !salesData ||
  //     !salesData.total_orders ||
  //     !salesData.recent_transactions
  //   ) {
  //     return "New";
  //   }

  //   const totalSpent = salesData.total_sales || 0;
  //   const orderCount = salesData.total_orders || 0;

  //   // Recency - days since last purchase
  //   const lastPurchaseDate = salesData.recent_transactions[0]?.invoice_date;
  //   const recency = lastPurchaseDate
  //     ? Math.floor(
  //         (new Date() - new Date(lastPurchaseDate)) / (1000 * 60 * 60 * 24)
  //       )
  //     : 999;

  //   // Scoring
  //   let recencyScore = recency < 30 ? 3 : recency < 90 ? 2 : 1;
  //   let frequencyScore = orderCount > 10 ? 3 : orderCount > 5 ? 2 : 1;
  //   let monetaryScore =
  //     totalSpent > 100000000 ? 3 : totalSpent > 50000000 ? 2 : 1;

  //   // Segment determination
  //   const rfmScore = `${recencyScore}${frequencyScore}${monetaryScore}`;

  //   switch (rfmScore) {
  //     case "333":
  //       return "Champion";
  //     case "332":
  //     case "323":
  //     case "322":
  //       return "Loyal";
  //     case "331":
  //     case "313":
  //     case "321":
  //       return "Potential Loyal";
  //     case "312":
  //     case "311":
  //     case "231":
  //       return "New High Spender";
  //     case "232":
  //     case "233":
  //     case "223":
  //       return "Promising";
  //     case "221":
  //     case "212":
  //     case "211":
  //       return "Need Attention";
  //     case "132":
  //     case "131":
  //     case "123":
  //     case "122":
  //     case "121":
  //       return "At Risk";
  //     case "113":
  //     case "112":
  //     case "111":
  //       return "Can't Lose";
  //     default:
  //       return "New";
  //   }
  // };

  // Generate quarterly data for analysis
  const generateQuarterlyData = () => {
    if (
      !salesData ||
      !salesData.sales_by_month ||
      salesData.sales_by_month.length < 3
    ) {
      return [];
    }

    // Map months to quarters
    const quarters = {
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

    // Group sales by quarter
    const quarterData = {};

    salesData.sales_by_month.forEach((month) => {
      const [monthName, year] = month.month.split(" ");
      const quarter = `${quarters[monthName]} ${year}`;

      if (!quarterData[quarter]) {
        quarterData[quarter] = { quarter, amount: 0 };
      }

      quarterData[quarter].amount += month.amount;
    });

    // Convert to array and sort
    return Object.values(quarterData).sort((a, b) => {
      const [aQ, aY] = a.quarter.split(" ");
      const [bQ, bY] = b.quarter.split(" ");

      if (aY !== bY) return parseInt(aY) - parseInt(bY);
      return aQ.localeCompare(bQ);
    });
  };

  // Generate radar chart data for customer profile analysis
  // const generateRadarData = () => {
  //   if (!salesData) return [];

  //   const loyaltyScore = calculateLoyaltyScore();
  //   const purchaseTrend = calculatePurchaseTrend();
  //   const totalSpent = salesData.total_sales || 0;
  //   const orderCount = salesData.total_orders || 0;
  //   const productVariety = salesData.top_products
  //     ? salesData.top_products.length
  //     : 0;

  //   // Normalize values to 0-100 scale for radar chart
  //   return [
  //     {
  //       subject: "Loyalty",
  //       value: loyaltyScore,
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Spending",
  //       value: Math.min(100, totalSpent / 1000000), // 100M IDR is max score
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Frequency",
  //       value: Math.min(100, orderCount * 5), // 20 orders is max score
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Product Range",
  //       value: Math.min(100, productVariety * 10), // 10 products is max score
  //       fullMark: 100,
  //     },
  //     {
  //       subject: "Growth Trend",
  //       value: Math.min(100, Math.max(0, purchaseTrend.trend + 50)), // -50% to +50% → 0 to 100
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
            <p className="text-gray-500 text-sm">
              Customer ID: {customer?.customer_id}
            </p>
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

  // Calculate additional metrics for analysis
  // const purchaseFrequency = calculatePurchaseFrequency();
  // const loyaltyScore = calculateLoyaltyScore();
  // const { trend: purchaseTrend, description: trendDescription } =
  calculatePurchaseTrend();
  // const customerSegment = calculateCustomerSegment();
  const quarterlyData = generateQuarterlyData();
  // const radarData = generateRadarData();

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
      </div>

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
              activeTab === "analysis"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("analysis")}
          >
            Detailed Analysis
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "products"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("products")}
          >
            Product Insights
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Complete Profile
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
            >
              {months === "all" ? "All Time" : `${months} Months`}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
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

          {/* Customer Segment & Loyalty */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="bg-yellow-50 rounded-md p-4 border border-yellow-100"
              title="Customer classification based on RFM (Recency, Frequency, Monetary) analysis"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-2 mr-3">
                  <Tag size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Segment</p>
                  <p className="text-xl font-semibold">{customerSegment}</p>
                </div>
              </div>
            </div>
            <div
              className="bg-red-50 rounded-md p-4 border border-red-100"
              title="Loyalty score based on purchase frequency, value, and product variety (0-100)"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-2 mr-3">
                  <Heart size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loyalty Score</p>
                  <p className="text-xl font-semibold">{loyaltyScore}/100</p>
                </div>
              </div>
            </div>
            <div
              className="bg-blue-50 rounded-md p-4 border border-blue-100"
              title="How often this customer makes purchases"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Repeat size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase Frequency</p>
                  <p className="text-xl font-semibold">{purchaseFrequency}</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Sales Trend - Actual vs Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Sales Trend (Actual vs Expected)
            </h2>
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
                        const actual = payload.find(
                          (p) => p.name === "Actual Sales"
                        );
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
                    name="Actual Sales"
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

          {/* Two-column layout for Top Products and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Products with Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-4">
                Top 8 Products by Sales
              </h2>

              {salesData.top_products && salesData.top_products.length > 0 ? (
                <>
                  {/* Add Pie Chart Visualization */}
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
                            `${
                              name.length > 10
                                ? name.substring(0, 10) + "..."
                                : name
                            }: ${(percent * 100).toFixed(0)}%`
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

                  {/* Table of Top Products */}
                  <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Product</th>
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
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
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

            {/* Customer Overview and Recent Transactions */}
            <div className="flex flex-col gap-6">
              {/* Customer Overview Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-semibold mb-3">
                  Customer Overview
                </h2>
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
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium">
                        {customer?.business_name || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <MapPin size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {customer?.city || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <Award size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">YTD Growth</p>
                      <p className="font-medium flex items-center">
                        {formatCurrency(salesData.this_ytd_sales)}
                        <span
                          className={`ml-2 text-xs ${
                            salesData.ytd_growth >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {salesData.ytd_growth >= 0 ? "↑" : "↓"}{" "}
                          {Math.abs(salesData.ytd_growth).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions - With matching height as top products */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex-grow">
                <h2 className="text-lg font-semibold mb-3">
                  Recent Transactions
                </h2>

                {salesData.recent_transactions &&
                salesData.recent_transactions.length > 0 ? (
                  <div className="overflow-y-auto" style={{ height: "330px" }}>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="text-left p-2">Invoice</th>
                          <th className="text-left p-2">Date</th>
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
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Clock size={32} className="mb-3 opacity-20" />
                    <p>No recent transactions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* DETAILED ANALYSIS TAB */}
      {activeTab === "analysis" && (
        <>
          {/* Business Intelligence Metrics */}
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
                    {formatPercent(salesData.ytd_growth)}
                    <span
                      className={`ml-2 text-xs ${
                        salesData.ytd_growth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {salesData.ytd_growth >= 0 ? "↑" : "↓"}
                    </span>
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
                    {formatCurrency(salesData.this_ytd_sales)}
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
                    {formatCurrency(salesData.previous_ytd_sales)}
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
                    {formatCurrency(salesData.this_month_sales)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Segment & Loyalty */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 rounded-md p-4 border border-yellow-100">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-2 mr-3">
                  <Tag size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Segment</p>
                  <p className="text-xl font-semibold">{customerSegment}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-md p-4 border border-red-100">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-2 mr-3">
                  <Heart size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loyalty Score</p>
                  <p className="text-xl font-semibold">{loyaltyScore}/100</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Repeat size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase Frequency</p>
                  <p className="text-xl font-semibold">{purchaseFrequency}</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Quarterly Sales Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Quarterly Sales Analysis
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quarterlyData}
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
                  <Bar dataKey="amount" name="Quarterly Sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Value Analysis */}
          {/* <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Customer Value Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={radarData}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Customer Profile"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-medium text-gray-700 mb-3">
                  Business Intelligence Insights
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-indigo-500"></div>
                    <span>
                      YTD Growth:{" "}
                      <strong>{formatPercent(salesData.ytd_growth)}</strong>{" "}
                      with{" "}
                      <strong>
                        {formatCurrency(salesData.this_ytd_sales)}
                      </strong>{" "}
                      this year vs{" "}
                      <strong>
                        {formatCurrency(salesData.previous_ytd_sales)}
                      </strong>{" "}
                      same period last year.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-green-500"></div>
                    <span>
                      Customer segment: <strong>{customerSegment}</strong> with
                      a loyalty score of <strong>{loyaltyScore}/100</strong>.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-blue-500"></div>
                    <span>
                      Purchase pattern shows{" "}
                      <strong>{purchaseFrequency}</strong> buying frequency with
                      an average order value of{" "}
                      <strong>
                        {formatCurrency(
                          salesData.total_sales / salesData.total_orders
                        )}
                      </strong>
                      .
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-purple-500"></div>
                    <span>
                      Overall sales trend is{" "}
                      <strong>{trendDescription.toLowerCase()}</strong> with a{" "}
                      <strong>{Math.abs(purchaseTrend).toFixed(1)}%</strong>{" "}
                      {purchaseTrend >= 0 ? "increase" : "decrease"} in recent
                      periods.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div> */}

          {/* Monthly Trend Analysis with Comparison */}
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
                            <div className="text-gray-700">
                              Orders:{" "}
                              {formatNumber(payload[0].payload.order_count)}
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

      {/* PRODUCT INSIGHTS TAB */}
      {activeTab === "products" && (
        <>
          {/* Product Purchase Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className="bg-blue-50 rounded-md p-4 border border-blue-100"
              title="Total number of unique products purchased by this customer"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Package size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Products Purchased</p>
                  <p className="text-lg font-semibold">
                    {salesData.all_products ? salesData.all_products.length : 0}
                  </p>
                </div>
              </div>
            </div>
            {/* <div
              className="bg-green-50 rounded-md p-4 border border-green-100"
              title="Percentage of sales from the most frequently purchased product"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <Percent size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Concentration</p>
                  <p className="text-lg font-semibold">
                    {salesData.all_products && salesData.all_products.length > 0
                      ? `${(
                          (salesData.all_products[0].total_amount /
                            salesData.total_sales) *
                          100
                        ).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div> */}
            <div
              className="bg-purple-50 rounded-md p-4 border border-purple-100"
              title="Total number of units purchased across all products"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-2 mr-3">
                  <ShoppingBag size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Units Purchased</p>
                  <p className="text-lg font-semibold">
                    {salesData.all_products
                      ? formatNumber(
                          salesData.all_products.reduce(
                            (total, product) => total + product.qty,
                            0
                          )
                        )
                      : "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Distribution Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Product Purchase Distribution
            </h2>

            {salesData.top_products && salesData.top_products.length > 0 ? (
              <>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData.top_products}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="total_amount"
                        nameKey="product_name"
                        label={({ name, percent }) =>
                          `${
                            name.length > 15
                              ? name.substring(0, 15) + "..."
                              : name
                          }: ${(percent * 100).toFixed(0)}%`
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

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Key Product Insights
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0"
                        style={{ backgroundColor: COLORS[0] }}
                      ></div>
                      <span>
                        <strong>
                          {salesData.top_products[0].product_name}
                        </strong>{" "}
                        accounts for
                        <strong>
                          {" "}
                          {(
                            (salesData.top_products[0].total_amount /
                              salesData.total_sales) *
                            100
                          ).toFixed(1)}
                          %
                        </strong>{" "}
                        of total purchases.
                      </span>
                    </li>
                    {salesData.top_products.length > 2 && (
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-green-500"></div>
                        <span>
                          The top 3 products make up
                          <strong>
                            {" "}
                            {(
                              (salesData.top_products
                                .slice(0, 3)
                                .reduce((sum, p) => sum + p.total_amount, 0) /
                                salesData.total_sales) *
                              100
                            ).toFixed(1)}
                            %
                          </strong>
                          of all purchases.
                        </span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 bg-blue-500"></div>
                      <span>
                        Customer has purchased{" "}
                        <strong>{salesData.all_products.length}</strong>{" "}
                        different products over the selected time period.
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <ShoppingCart size={48} className="mb-4 opacity-20" />
                <p>No product distribution data available</p>
              </div>
            )}
          </div>

          {/* All Products Ever Purchased Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                All Product Purchase History
              </h2>
              <div className="text-sm text-gray-500">
                {salesData.all_products ? salesData.all_products.length : 0}{" "}
                products total
              </div>
            </div>

            {salesData.all_products && salesData.all_products.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
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
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          First Purchase
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Purchase
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesData.all_products.map((product, index) => (
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
                                {product.product_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            {formatNumber(product.qty)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            {formatCurrency(product.total_amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            {(
                              (product.total_amount / salesData.total_sales) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                            {product.first_purchase
                              ? new Date(
                                  product.first_purchase
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                            {product.last_purchase
                              ? new Date(
                                  product.last_purchase
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            {product.purchase_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <Package size={32} className="mb-3 opacity-20" />
                <p>No product purchase data available</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <>
          {/* Profile Summary - All data fields from DB model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4">Customer Profile</h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">ID</div>
                  <div className="w-2/3">{customer?.id}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Customer Code
                  </div>
                  <div className="w-2/3">{customer?.customer_code}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Customer ID
                  </div>
                  <div className="w-2/3">{customer?.customer_id}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Business Name
                  </div>
                  <div className="w-2/3">{customer?.business_name}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Extra (Phone)
                  </div>
                  <div className="w-2/3">
                    {customer?.extra || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Price Type
                  </div>
                  <div className="w-2/3">
                    {customer?.price_type || "Standard"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    NPWP (Tax ID)
                  </div>
                  <div className="w-2/3">
                    {customer?.npwp || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">NIK</div>
                  <div className="w-2/3">
                    {customer?.nik || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">City</div>
                  <div className="w-2/3">
                    {customer?.city || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Owner Name
                  </div>
                  <div className="w-2/3">
                    {customer?.owner_name || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Religion
                  </div>
                  <div className="w-2/3">
                    {customer?.religion || "Not specified"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4">
                Address Information
              </h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Address 1
                  </div>
                  <div className="w-2/3">
                    {customer?.address_1 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Address 2
                  </div>
                  <div className="w-2/3">
                    {customer?.address_2 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Address 3
                  </div>
                  <div className="w-2/3">
                    {customer?.address_3 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Address 4
                  </div>
                  <div className="w-2/3">
                    {customer?.address_4 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Address 5
                  </div>
                  <div className="w-2/3">
                    {customer?.address_5 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Owner Address 1
                  </div>
                  <div className="w-2/3">
                    {customer?.owner_address_1 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Owner Address 2
                  </div>
                  <div className="w-2/3">
                    {customer?.owner_address_2 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Owner Address 3
                  </div>
                  <div className="w-2/3">
                    {customer?.owner_address_3 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Owner Address 4
                  </div>
                  <div className="w-2/3">
                    {customer?.owner_address_4 || "Not specified"}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-gray-600 font-medium">
                    Owner Address 5
                  </div>
                  <div className="w-2/3">
                    {customer?.owner_address_5 || "Not specified"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Addresses */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4">
                Additional Addresses & System Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Additional Address
                    </div>
                    <div className="w-2/3">
                      {customer?.additional_address || "Not specified"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Additional Address 1
                    </div>
                    <div className="w-2/3">
                      {customer?.additional_address_1 || "Not specified"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Additional Address 2
                    </div>
                    <div className="w-2/3">
                      {customer?.additional_address_2 || "Not specified"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Additional Address 3
                    </div>
                    <div className="w-2/3">
                      {customer?.additional_address_3 || "Not specified"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Additional Address 4
                    </div>
                    <div className="w-2/3">
                      {customer?.additional_address_4 || "Not specified"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Additional Address 5
                    </div>
                    <div className="w-2/3">
                      {customer?.additional_address_5 || "Not specified"}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      First Purchase
                    </div>
                    <div className="w-2/3">
                      {salesData.first_purchase_date
                        ? new Date(
                            salesData.first_purchase_date
                          ).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Created Date
                    </div>
                    <div className="w-2/3">
                      {customer?.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">
                      Last Updated
                    </div>
                    <div className="w-2/3">
                      {customer?.updated_at
                        ? new Date(customer.updated_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Segment & Metrics */}
          {/* <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Customer Segment & Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">
                    Customer Segment
                  </h3>
                  <Tag size={18} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {customerSegment}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Based on RFM (Recency, Frequency, Monetary)
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">Loyalty Score</h3>
                  <Heart size={18} className="text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {loyaltyScore}/100
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${loyaltyScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">
                    Purchase Behavior
                  </h3>
                  <Activity size={18} className="text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {trendDescription}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span
                    className={
                      purchaseTrend >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {purchaseTrend >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(purchaseTrend).toFixed(1)}% from previous period
                  </span>
                </p>
              </div>
            </div>
          </div> */}

          {/* Purchase History Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Purchase History Summary
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-green-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          Total Lifetime Spent
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {formatCurrency(salesData.total_sales)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCart
                          size={16}
                          className="text-blue-600 mr-2"
                        />
                        <div className="text-sm font-medium text-gray-900">
                          Total Orders
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {formatNumber(salesData.total_orders)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard
                          size={16}
                          className="text-purple-600 mr-2"
                        />
                        <div className="text-sm font-medium text-gray-900">
                          Average Order Value
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {salesData.total_orders > 0
                        ? formatCurrency(
                            salesData.total_sales / salesData.total_orders
                          )
                        : formatCurrency(0)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-yellow-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          First Purchase
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {salesData.first_purchase_date
                        ? new Date(
                            salesData.first_purchase_date
                          ).toLocaleDateString()
                        : "Unknown"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-red-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          Most Recent Purchase
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {salesData.recent_transactions &&
                      salesData.recent_transactions.length > 0
                        ? new Date(
                            salesData.recent_transactions[0].invoice_date
                          ).toLocaleDateString()
                        : "Unknown"}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={16} className="text-blue-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          Products Purchased
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {salesData.all_products
                        ? salesData.all_products.length
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Bookmark size={16} className="text-purple-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          Most Purchased Product
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {salesData.top_products &&
                      salesData.top_products.length > 0
                        ? salesData.top_products[0].product_name
                        : "None"}
                    </td>
                  </tr>
                  {/* <tr className="bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Repeat size={16} className="text-indigo-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          Purchase Frequency
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {purchaseFrequency}
                    </td>
                  </tr> */}
                  {/* <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart size={16} className="text-red-600 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          Customer Loyalty Score
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold">
                      {loyaltyScore}/100
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerDetailPage;
