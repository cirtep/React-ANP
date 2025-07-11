import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Search,
  Save,
  Info,
  BarChart2,
  PieChart,
  Download,
  Layers,
  AlertCircle,
  ChevronDown,
  FileText,
} from "lucide-react";

const ForecastPage = () => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [savedForecasts, setSavedForecasts] = useState([]);
  // const [loadingSaved, setLoadingSaved] = useState(false);
  // const [savedError, setSavedError] = useState(null);

  const [mapeValue, setMapeValue] = useState(null);

  const [productQuery, setProductQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductSearch, setShowProductSearch] = useState(false);

  const [forecastData, setForecastData] = useState([]);
  // const [historicalData, setHistoricalData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [forecastPeriod, setForecastPeriod] = useState(6); // Default 6 months
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productAnalysis, setProductAnalysis] = useState(null);

  const searchRef = useRef(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // const getMapeInfo = (mape) => {
  //   if (mape === null) return { color: "gray", message: "Not available" };
  //   if (mape < 10) return { color: "green", message: "Excellent" };
  //   if (mape < 20) return { color: "blue", message: "Good" };
  //   if (mape < 30) return { color: "yellow", message: "Fair" };
  //   return { color: "red", message: "Poor" };
  // };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowProductSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search for products when query changes
  useEffect(() => {
    const searchProducts = async () => {
      if (productQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}/api/inventory/search?q=${encodeURIComponent(
            productQuery
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to search products");
        const result = await response.json();
        setSearchResults(result.data || []);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };

    const debounce = setTimeout(() => {
      if (productQuery) searchProducts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [productQuery, baseUrl]);

  // Function to fetch saved forecasts
  const fetchSavedForecasts = async () => {
    if (!selectedProduct) return;

    // setLoadingSaved(true);
    // setSavedError(null);

    try {
      const response = await fetch(
        `${baseUrl}/api/forecast/saved/${selectedProduct.product_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch saved forecasts");
      }

      const result = await response.json();
      setSavedForecasts(result.data || []);
      // setLoadingSaved(false);
    } catch (error) {
      console.error("Error fetching saved forecasts:", error);
      // setSavedError(error.message);
      // setLoadingSaved(false);
    }
  };

  // useEffect to fetch forecast, historical, and saved forecast data when selectedProduct changes
  useEffect(() => {
    if (!selectedProduct) return;

    const fetchForecastData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch forecast data
        const forecastResponse = await fetch(
          `${baseUrl}/api/forecast/sales_forecast?product_id=${selectedProduct.product_id}&periods=${forecastPeriod}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch forecast data");
        }
        const forecastResult = await forecastResponse.json();

        setMapeValue(forecastResult.data.mape);

        // Fetch historical data - last 24 months
        const historicalResponse = await fetch(
          `${baseUrl}/api/inventory/product_history?product_id=${selectedProduct.product_id}&months=24`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!historicalResponse.ok) {
          throw new Error("Failed to fetch historical data");
        }
        const historicalResult = await historicalResponse.json();

        // Also fetch saved forecasts
        await fetchSavedForecasts();

        // Format the data
        const formattedHistorical = historicalResult.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          actual: Math.round(item.quantity),
          type: "historical",
        }));

        const formattedForecast = forecastResult.data.forecast.map((item) => ({
          ds: item.ds,
          date: new Date(item.ds).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          forecast: Math.round(item.yhat),
          lower: Math.round(item.yhat_lower),
          upper: Math.round(item.yhat_upper),
          type: item.is_historical ? "historical" : "forecast",
        }));

        // Combine the data by merging historical and forecast entries
        const combined = [...formattedHistorical];

        formattedForecast.forEach((forecastItem) => {
          const existingIndex = combined.findIndex(
            (item) => item.date === forecastItem.date
          );

          if (existingIndex >= 0) {
            // If the date exists in historical, add forecast values to that entry
            combined[existingIndex] = {
              ...combined[existingIndex],
              forecast: forecastItem.forecast,
              lower: forecastItem.lower,
              upper: forecastItem.upper,
              type: "both", // Mark as both historical and forecast
            };
          } else {
            combined.push(forecastItem);
          }
        });

        // Sort by date
        combined.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });

        // Optionally, fetch product analysis (if available)
        const analysisResponse = await fetch(
          `${baseUrl}/api/inventory/product_analysis?product_id=${selectedProduct.product_id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json();
          setProductAnalysis(analysisResult.data);
        }

        // Update state with fetched and formatted data
        // setHistoricalData(formattedHistorical);
        setForecastData(formattedForecast);
        setCombinedData(combined);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [selectedProduct, forecastPeriod, baseUrl]);

  // Handle selecting a product from search results
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setProductQuery(product.product_name);
    setShowProductSearch(false);
  };

  // Handle saving the forecast
  const saveForecast = async () => {
    if (!selectedProduct || !forecastData.length) return;

    try {
      // Create a dictionary to ensure each date is only included once
      const forecastMap = new Map();

      // First add the historical data points
      combinedData.forEach((item) => {
        if (item.forecast !== undefined) {
          const formattedDate = formatDateForAPI(item.date);
          forecastMap.set(formattedDate, {
            ds: formattedDate,
            is_historical: item.date <= getCurrentMonthFormatted(),
            yhat: item.forecast,
            yhat_lower: item.lower,
            yhat_upper: item.upper,
          });
        }
      });

      // Then add future data (will overwrite any duplicate historical dates)
      forecastData.forEach((item) => {
        if (item.type === "forecast" || item.is_historical === false) {
          const dateKey = item.ds;
          forecastMap.set(dateKey, {
            ds: item.ds,
            is_historical: false,
            forecast: item.forecast,
            lower: item.lower,
            upper: item.upper,
          });
        }
      });

      // Convert map values to array
      const combinedForecastData = Array.from(forecastMap.values());

      // Debug info (can be removed later)
      console.log("Saving forecast data:", combinedForecastData);
      console.log("Total entries:", combinedForecastData.length);

      const response = await fetch(`${baseUrl}/api/forecast/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: selectedProduct.product_id,
          forecast_data: combinedForecastData,
          mape: mapeValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save forecast");
      }

      const result = await response.json();
      alert(
        `Forecast saved successfully: ${result.data.saved} new entries, ${result.data.updated} updates`
      );

      // Refresh saved forecasts after saving
      fetchSavedForecasts();
    } catch (error) {
      console.error("Error saving forecast:", error);
      alert("Error saving forecast: " + error.message);
    }
  };

  // Helper function to convert date format from "Feb 2025" to "2025-02-01"
  const formatDateForAPI = (dateStr) => {
    try {
      const parts = dateStr.split(" ");
      if (parts.length !== 2) return dateStr;

      const month = new Date(Date.parse(`${parts[0]} 1, 2000`)).getMonth() + 1;
      const year = parts[1];
      return `${year}-${month.toString().padStart(2, "0")}-01`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  };

  const exportForecast = (exportType = "all") => {
    if (!combinedData.length && !savedForecasts.length) return;

    // Create URL with parameters
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    let url = `${baseUrl}/api/forecast/export?product_id=${selectedProduct.product_id}&type=${exportType}`;

    // For current forecast data, we need to pass it as a parameter
    if (exportType === "all" || exportType === "current") {
      // Stringify the combined data and encode it
      const currentData = encodeURIComponent(JSON.stringify(combinedData));
      url += `&current_data=${currentData}`;
    }

    // Use fetch API to download the file
    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        // Create object URL for the blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;

        // Set the file name
        const fileName = `${
          selectedProduct?.product_name || "product"
        }_${exportType}_forecast_${today}.xlsx`;
        a.download = fileName;

        // Append to the document, click, and clean up
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error("Error downloading the Excel file:", error);
        alert("Error downloading the Excel file. Please try again.");
      });
  };

  // Get current month for the ReferenceLine in the chart
  const getCurrentMonthFormatted = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Calculate simple forecast statistics
  const getStatistics = () => {
    if (!forecastData.length) return null;

    const values = forecastData.map((item) => item.forecast);
    return {
      averageForecast: Math.round(
        values.reduce((a, b) => a + b, 0) / values.length
      ),
      maxForecast: Math.round(Math.max(...values)),
      minForecast: Math.round(Math.min(...values)),
    };
  };

  const stats = getStatistics();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header and Product Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center mb-4 md:mb-0">
          <TrendingUp className="mr-2 text-blue-600" />
          Sales Forecast
        </h1>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={productQuery}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setShowProductSearch(true);
                }}
                onFocus={() => setShowProductSearch(true)}
                placeholder="Search for a product..."
                className="w-full md:w-80 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            {showProductSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.product_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="font-medium">{product.product_name}</div>
                      <div className="text-xs text-gray-500">
                        ID: {product.product_id} | Stock: {product.qty}{" "}
                        {product.unit}
                      </div>
                    </div>
                  ))
                ) : productQuery.length >= 2 ? (
                  <div className="p-3 text-gray-500 text-center">
                    No products found
                  </div>
                ) : (
                  <div className="p-3 text-gray-500 text-center">
                    Type at least 2 characters
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedProduct && (
            <>
              <div className="flex">
                <button
                  onClick={() => setForecastPeriod(3)}
                  className={`px-3 py-2 rounded-l ${
                    forecastPeriod === 3
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  3 Months
                </button>
                <button
                  onClick={() => setForecastPeriod(6)}
                  className={`px-3 py-2 rounded-r ${
                    forecastPeriod === 6
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  6 Months
                </button>
              </div>
              <button
                onClick={saveForecast}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                disabled={loading || !forecastData.length}
              >
                <Save size={18} className="mr-1" /> Save
              </button>
              {/* Replace your existing export button with this enhanced version */}
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                  disabled={
                    loading || (!forecastData.length && !savedForecasts.length)
                  }
                >
                  <Download size={18} className="mr-1" /> Export
                  <ChevronDown size={14} className="ml-1" />
                </button>

                {showExportDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="rounded-md py-1">
                      <button
                        onClick={() => {
                          exportForecast("all");
                          setShowExportDropdown(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        All Forecasts
                      </button>
                      <button
                        onClick={() => {
                          exportForecast("current");
                          setShowExportDropdown(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        disabled={!forecastData.length}
                      >
                        Current Forecast Only
                      </button>
                      <button
                        onClick={() => {
                          exportForecast("saved");
                          setShowExportDropdown(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        disabled={!savedForecasts.length}
                      >
                        Saved Forecasts Only
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Info */}
      {selectedProduct && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-blue-800">
                {selectedProduct.product_name}
              </h2>
              <p className="text-sm text-blue-600">
                Code: {selectedProduct.product_id} | Category:{" "}
                {selectedProduct.category || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-800">
                Current Stock:
              </div>
              <div className="text-lg font-bold text-blue-700">
                {selectedProduct.qty} {selectedProduct.unit}
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedProduct && !loading && !error && (
        <div className="flex flex-col items-center justify-center bg-gray-50 p-8 rounded-lg border border-gray-200 h-96">
          <Search size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">
            Start by searching for a product
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            Enter a product name or code in the search box above to generate a
            forecast for that product.
          </p>
        </div>
      )}

      {loading && (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-3" size={24} />
          <div>
            <h3 className="font-medium text-red-800 mb-1">
              Error loading forecast
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Chart and Summary Table */}
      {selectedProduct && !loading && !error && combinedData.length > 0 && (
        <>
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 h-96">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="font-medium text-gray-700">
                Historical Data and Forecast ({forecastPeriod} Months)
              </h3>
              <div className="flex items-center text-sm">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Actual</span>
                </div>
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Forecast</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-200 rounded-full mr-1"></div>
                  <span>Bounds</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    const nameMap = {
                      actual: "Actual",
                      forecast: "Forecast",
                      lower: "Lower Bound",
                      upper: "Upper Bound",
                    };
                    return [value, nameMap[name] || name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  name="Actual"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#10B981"
                  name="Forecast"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  name="Upper Bound"
                  stroke="#FCA5A5"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  name="Lower Bound"
                  stroke="#FCA5A5"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <ReferenceLine
                  x={getCurrentMonthFormatted()}
                  stroke="#6B7280"
                  strokeWidth={2}
                  label={{
                    value: "Now",
                    position: "insideTopRight",
                    fill: "#6B7280",
                    fontSize: 12,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {mapeValue !== null && (
            <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">
                Forecast Accuracy
              </h3>
              <div className="flex items-center">
                <div className="mr-4">
                  <span className="text-gray-600 text-sm">
                    MAPE (Mean Absolute Percentage Error):
                  </span>
                  <span className="ml-2 font-semibold">
                    {mapeValue.toFixed(2)}%
                  </span>
                </div>

                {/* <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mapeValue < 10
                      ? "bg-green-100 text-green-800"
                      : mapeValue < 20
                      ? "bg-blue-100 text-blue-800"
                      : mapeValue < 30
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {getMapeInfo(mapeValue).message}
                </div> */}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <i>
                  Lower values indicate better forecast accuracy. MAPE
                  represents the average percentage difference between
                  forecasted and actual values.
                </i>
              </p>
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center">
              <Calendar className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Average Forecast</p>
                <p className="text-xl font-bold text-blue-700">
                  {stats?.averageForecast || "N/A"}{" "}
                  {selectedProduct?.unit || "units"}
                </p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center">
              <BarChart2 className="mr-3 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Peak Forecast</p>
                <p className="text-xl font-bold text-green-700">
                  {stats?.maxForecast || "N/A"}{" "}
                  {selectedProduct?.unit || "units"}
                </p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
              <TrendingUp className="mr-3 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Lowest Forecast</p>
                <p className="text-xl font-bold text-red-700">
                  {stats?.minForecast || "N/A"}{" "}
                  {selectedProduct?.unit || "units"}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`mr-6 py-2 ${
                  activeTab === "summary"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("summary")}
              >
                <span className="flex items-center">
                  <FileText size={18} className="mr-2" />
                  Summary Table
                </span>
              </button>
              <button
                className={`py-2 ${
                  activeTab === "analysis"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("analysis")}
              >
                <span className="flex items-center">
                  <Layers size={18} className="mr-2" />
                  Product Analysis
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Summary Table Tab */}
            {activeTab === "summary" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                      </th>
                      {combinedData.map((item, index) => (
                        <th
                          key={index}
                          className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
              ${
                item.date === getCurrentMonthFormatted()
                  ? "bg-blue-50"
                  : index % 2 === 0
                  ? "bg-gray-50"
                  : "bg-white"
              }`}
                        >
                          {item.date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Actual Row */}
                    <tr>
                      <td className="px-4 py-3 bg-gray-50 font-medium">
                        Actual
                      </td>
                      {combinedData.map((item, index) => (
                        <td
                          key={index}
                          className={`px-4 py-3 
              ${
                item.date === getCurrentMonthFormatted()
                  ? "bg-blue-50 font-medium"
                  : ""
              }`}
                        >
                          {item.actual || "-"}
                        </td>
                      ))}
                    </tr>

                    {/* Forecast Row */}
                    <tr>
                      <td className="px-4 py-3 bg-gray-50 font-medium">
                        Forecast
                      </td>
                      {combinedData.map((item, index) => {
                        // Format date string to match saved forecast format (YYYY-MM-01)
                        const dateParts = item.date.split(" ");
                        const month =
                          new Date(`${dateParts[0]} 1, 2000`).getMonth() + 1;
                        const year = dateParts[1];
                        const formattedMonth = month
                          .toString()
                          .padStart(2, "0");
                        const formattedDate = `${year}-${formattedMonth}-01`;

                        // Find saved forecast for this month using exact date comparison
                        const savedForecast = savedForecasts.find((sf) => {
                          const sfDate = sf.ds.substring(0, 10); // Get YYYY-MM-DD part
                          return sfDate === formattedDate;
                        });

                        const valueToShow = savedForecast
                          ? Math.round(savedForecast.yhat)
                          : item.forecast;

                        return (
                          <td
                            key={index}
                            className={`px-4 py-3 ${
                              item.date === getCurrentMonthFormatted()
                                ? "bg-blue-50 font-medium"
                                : savedForecast
                                ? "bg-green-50"
                                : ""
                            }`}
                          >
                            {savedForecast ? (
                              <span
                                title={`Saved on ${savedForecast.saved_at}`}
                              >
                                {valueToShow || "-"}
                                <span className="ml-1 text-xs text-green-600">
                                  *
                                </span>
                              </span>
                            ) : (
                              valueToShow || "-"
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Lower Bound Row */}
                    <tr>
                      <td className="px-4 py-3 bg-gray-50 font-medium">
                        Lower Bound
                      </td>
                      {combinedData.map((item, index) => {
                        // Format date string to match saved forecast format (YYYY-MM-01)
                        const dateParts = item.date.split(" ");
                        const month =
                          new Date(`${dateParts[0]} 1, 2000`).getMonth() + 1;
                        const year = dateParts[1];
                        const formattedMonth = month
                          .toString()
                          .padStart(2, "0");
                        const formattedDate = `${year}-${formattedMonth}-01`;

                        // Find saved forecast for this month using exact date comparison
                        const savedForecast = savedForecasts.find((sf) => {
                          const sfDate = sf.ds.substring(0, 10); // Get YYYY-MM-DD part
                          return sfDate === formattedDate;
                        });

                        const valueToShow = savedForecast
                          ? Math.round(savedForecast.yhat_lower)
                          : item.lower;

                        return (
                          <td
                            key={index}
                            className={`px-4 py-3 ${
                              item.date === getCurrentMonthFormatted()
                                ? "bg-blue-50 font-medium"
                                : savedForecast
                                ? "bg-green-50"
                                : ""
                            }`}
                          >
                            {valueToShow || "-"}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Upper Bound Row */}
                    <tr>
                      <td className="px-4 py-3 bg-gray-50 font-medium">
                        Upper Bound
                      </td>
                      {combinedData.map((item, index) => {
                        // Format date string to match saved forecast format (YYYY-MM-01)
                        const dateParts = item.date.split(" ");
                        const month =
                          new Date(`${dateParts[0]} 1, 2000`).getMonth() + 1;
                        const year = dateParts[1];
                        const formattedMonth = month
                          .toString()
                          .padStart(2, "0");
                        const formattedDate = `${year}-${formattedMonth}-01`;

                        // Find saved forecast for this month using exact date comparison
                        const savedForecast = savedForecasts.find((sf) => {
                          const sfDate = sf.ds.substring(0, 10); // Get YYYY-MM-DD part
                          return sfDate === formattedDate;
                        });

                        const valueToShow = savedForecast
                          ? Math.round(savedForecast.yhat_upper)
                          : item.upper;

                        return (
                          <td
                            key={index}
                            className={`px-4 py-3 ${
                              item.date === getCurrentMonthFormatted()
                                ? "bg-blue-50 font-medium"
                                : savedForecast
                                ? "bg-green-50"
                                : ""
                            }`}
                          >
                            {valueToShow || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>

                {savedForecasts.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <span className="inline-block h-2 w-2 bg-green-600 rounded-full mr-1"></span>
                    <span>
                      * Values with green background are from saved forecasts
                    </span>
                  </div>
                )}
              </div>
            )}
            {activeTab === "analysis" && (
              <div>
                {productAnalysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <Info className="mr-2 text-blue-500" size={20} />
                        General Information
                      </h3>
                      <div className="space-y-3">
                        {/* <div>
                          <span className="text-sm text-gray-500">
                            Last Restocked
                          </span>
                          <p className="font-medium">
                            {productAnalysis.last_restocked || "N/A"}
                          </p>
                        </div> */}
                        <div>
                          <span className="text-sm text-gray-500">
                            Supplier
                          </span>
                          <p className="font-medium">
                            {productAnalysis.supplier_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Min Stock Level
                          </span>
                          <p className="font-medium">
                            {productAnalysis.min_stock || "N/A"}{" "}
                            {selectedProduct?.unit || "units"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Max Stock Level
                          </span>
                          <p className="font-medium">
                            {productAnalysis.max_stock || "N/A"}{" "}
                            {selectedProduct?.unit || "units"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Standard Price
                          </span>
                          <p className="font-medium">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(productAnalysis.standard_price || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <BarChart2 className="mr-2 text-green-500" size={20} />
                        Sales Performance
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">
                            Total Sales
                          </span>
                          <p className="font-medium">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(productAnalysis.total_revenue || 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Gross Profit
                          </span>
                          <p className="font-medium">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(productAnalysis.gross_profit || 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Margin %
                          </span>
                          <p className="font-medium">
                            {(productAnalysis.profit_margin || 0).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Sales Trend
                          </span>
                          <p
                            className={`font-medium ${
                              productAnalysis.sales_trend > 0
                                ? "text-green-600"
                                : productAnalysis.sales_trend < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {productAnalysis.sales_trend > 0
                              ? "↑ "
                              : productAnalysis.sales_trend < 0
                              ? "↓ "
                              : ""}
                            {Math.abs(productAnalysis.sales_trend || 0).toFixed(
                              1
                            )}
                            %{" "}
                            {productAnalysis.sales_trend > 0
                              ? "Increase"
                              : productAnalysis.sales_trend < 0
                              ? "Decrease"
                              : "No Change"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-200 md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <PieChart className="mr-2 text-purple-500" size={20} />
                        Rate of Demand
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <span className="text-sm text-gray-500">
                            Last 3 Months
                          </span>
                          <p className="font-medium">
                            {productAnalysis.sales_90_days || 0}{" "}
                            {selectedProduct?.unit || "units"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {((productAnalysis.sales_90_days || 0) / 3).toFixed(
                              1
                            )}{" "}
                            units/month
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Last 6 Months
                          </span>
                          <p className="font-medium">
                            {productAnalysis.sales_6_months ||
                              (productAnalysis.sales_90_days
                                ? Math.round(productAnalysis.sales_90_days * 2)
                                : 0)}{" "}
                            {selectedProduct?.unit || "units"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(
                              (productAnalysis.sales_6_months ||
                                (productAnalysis.sales_90_days
                                  ? Math.round(
                                      productAnalysis.sales_90_days * 2
                                    )
                                  : 0)) / 6
                            ).toFixed(1)}{" "}
                            units/month
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Last 12 Months
                          </span>
                          <p className="font-medium">
                            {productAnalysis.sales_12_months || 0}{" "}
                            {selectedProduct?.unit || "units"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(
                              (productAnalysis.sales_12_months || 0) / 12
                            ).toFixed(1)}{" "}
                            units/month
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Daily Demand Rate
                          </span>
                          <p className="font-medium">
                            {productAnalysis.daily_demand_rate?.toFixed(2) || 0}{" "}
                            {selectedProduct?.unit || "units"}/day
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Weekly Demand Rate
                          </span>
                          <p className="font-medium">
                            {productAnalysis.weekly_demand_rate?.toFixed(2) ||
                              0}{" "}
                            {selectedProduct?.unit || "units"}/week
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Monthly Demand Rate
                          </span>
                          <p className="font-medium">
                            {productAnalysis.monthly_demand_rate?.toFixed(2) ||
                              0}{" "}
                            {selectedProduct?.unit || "units"}/month
                          </p>
                        </div>
                        {/* <div>
                          <span className="text-sm text-gray-500">
                            Seasonal Variability
                          </span>
                          <p
                            className={`font-medium ${
                              productAnalysis.seasonal_variability > 70
                                ? "text-red-600"
                                : productAnalysis.seasonal_variability > 30
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {productAnalysis.seasonal_variability?.toFixed(1) ||
                              0}
                            %
                            {productAnalysis.seasonal_variability > 70
                              ? " (High)"
                              : productAnalysis.seasonal_variability > 30
                              ? " (Medium)"
                              : " (Low)"}
                          </p>
                        </div> */}
                        <div>
                          <span className="text-sm text-gray-500">
                            Stock Coverage
                          </span>
                          <p className="font-medium">
                            {productAnalysis.stock_coverage || 0} days
                          </p>
                        </div>
                        {/* <div>
                          <span className="text-sm text-gray-500">
                            Reorder Alert
                          </span>
                          <p
                            className={`font-medium ${
                              productAnalysis.reorder_alert
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {productAnalysis.reorder_alert
                              ? "Yes - Reorder Recommended"
                              : "No - Stock Sufficient"}
                          </p>
                        </div> */}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Info size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Analysis Available
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Product analysis data is not available. This could be due
                      to insufficient historical data.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ForecastPage;
