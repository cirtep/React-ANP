import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, BarChart } from "lucide-react";

const ForecastPage = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aggregationType, setAggregationType] = useState("M"); // Monthly by default
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/sales_forecast?aggregation=${aggregationType}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          const formattedData = result.data.map((item) => ({
            ...item,
            ds: new Date(item.ds).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            yhat: Math.round(item.yhat),
          }));

          setForecastData(formattedData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching forecast data:", error);
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [aggregationType]);

  const getStatistics = () => {
    if (forecastData.length === 0) return null;

    const values = forecastData.map((item) => item.yhat);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" />
          Sales Forecast
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setAggregationType("W")}
            className={`px-3 py-1 rounded ${
              aggregationType === "W" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setAggregationType("M")}
            className={`px-3 py-1 rounded ${
              aggregationType === "M" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ds" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="yhat"
                  stroke="#3B82F6"
                  name="Forecast"
                  strokeWidth={2}
                  dot={false}
                />
                {/* <Line
                  type="monotone"
                  dataKey="yhat_upper"
                  stroke="#10B981"
                  strokeDasharray="5 5"
                  dot={false}
                /> */}
                <Line
                  type="monotone"
                  dataKey="yhat_lower"
                  name="Lower Bounce"
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center">
              <Calendar className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Average Forecast</p>
                <p className="text-xl font-bold text-blue-700">
                  {stats?.averageForecast || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center">
              <BarChart className="mr-3 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Peak Forecast</p>
                <p className="text-xl font-bold text-green-700">
                  {stats?.maxForecast || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
              <TrendingUp className="mr-3 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Lowest Forecast</p>
                <p className="text-xl font-bold text-red-700">
                  {stats?.minForecast || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ForecastPage;
