import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SettingsOverlay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fromPage = location.state?.from || "/";

  // State for file uploads
  const [transactionFile, setTransactionFile] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [customerFile, setCustomerFile] = useState(null);
  const [productStockFile, setProductStockFile] = useState(null);

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [activeImport, setActiveImport] = useState(null); // Tracks which import is active
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // New state for active tab
  const [activeTab, setActiveTab] = useState("import"); // 'import' or 'parameters'

  const handleClose = () => {
    navigate(fromPage, { replace: true });
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // Generic import handler
  const handleImport = async (fileType, file, endpoint) => {
    if (!file) {
      showMessage(`Mohon upload file ${fileType} terlebih dahulu.`, "error");
      return;
    }

    setLoading(true);
    setActiveImport(fileType);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(`Import ${fileType} berhasil!`);
      } else {
        showMessage(
          `Gagal: ${result.message || "Terjadi kesalahan."}`,
          "error"
        );
      }
    } catch (error) {
      showMessage(`Gagal menghubungi server: ${error.message}`, "error");
    } finally {
      setLoading(false);
      setActiveImport(null);
    }
  };

  // Specific import handlers using the generic handler
  const handleImportTransaction = () =>
    handleImport("Transaction", transactionFile, "/api/import/transactions");

  const handleImportProduct = () =>
    handleImport("Product", productFile, "/api/import/products");

  const handleImportCustomer = () =>
    handleImport("Customer", customerFile, "/api/import/customers");

  const handleImportProductStock = () =>
    handleImport(
      "Product Stock",
      productStockFile,
      "/api/import/product_stock"
    );

  // Component for consistent import forms
  const ImportForm = ({
    title,
    description,
    file,
    setFile,
    onImport,
    type,
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>

      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      <div className="flex flex-col gap-4">
        <div className="w-full">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            {!file && (
              <p className="text-center text-gray-500 mt-2">Choose file</p>
            )}
          </div>

          {file && (
            <div className="mt-2 bg-blue-50 p-2 rounded flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span className="text-sm font-medium text-blue-700 truncate flex-1">
                {file.name}
              </span>
              <button
                onClick={() => setFile(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onImport}
          disabled={loading}
          className={`w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md transition duration-200 
            ${loading && activeImport === type ? "bg-blue-400" : ""} 
            disabled:bg-blue-300 disabled:cursor-not-allowed flex justify-center items-center gap-2`}
        >
          {loading && activeImport === type ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Importing...</span>
            </>
          ) : (
            "Import"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        </div>
        <button
          onClick={handleClose}
          className="cursor-pointer text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center transition duration-200"
          aria-label="Close Settings"
        >
          X
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-4">
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === "import"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("import")}
            >
              Data Import
            </button>
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === "parameters"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("parameters")}
            >
              Forecast Parameters
            </button>
          </div>
        </div>
      </div>

      {/* Notification message */}
      {message && (
        <div
          className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl 
            ${
              messageType === "error"
                ? "bg-red-100 text-red-700 border-l-4 border-red-500"
                : "bg-green-100 text-green-700 border-l-4 border-green-500"
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={
                messageType === "error" ? "text-red-500" : "text-green-500"
              }
            >
              {messageType === "error" ? "⚠️" : "✓"}
            </span>
            {message}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "import" ? (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                Data Import
              </h2>
              <p className="text-gray-600">
                Upload files below to import your data.
              </p>
            </div>

            {/* Grid layout for import forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImportForm
                title="Transaction Data"
                description="Import transaction history."
                file={transactionFile}
                setFile={setTransactionFile}
                onImport={handleImportTransaction}
                type="Transaction"
              />

              <ImportForm
                title="Product Data"
                description="Import product catalog."
                file={productFile}
                setFile={setProductFile}
                onImport={handleImportProduct}
                type="Product"
              />

              <ImportForm
                title="Customer Data"
                description="Import customer information."
                file={customerFile}
                setFile={setCustomerFile}
                onImport={handleImportCustomer}
                type="Customer"
              />

              <ImportForm
                title="Product Stock Data"
                description="Import product stock."
                file={productStockFile}
                setFile={setProductStockFile}
                onImport={handleImportProductStock}
                type="ProductStock"
              />
            </div>
          </>
        ) : (
          <ForecastParameterTab showMessage={showMessage} baseUrl={baseUrl} />
        )}
      </div>
    </div>
  );
};

// Forecast Parameter Tuning Tab Component
const ForecastParameterTab = ({ showMessage, baseUrl }) => {
  // Parameter ranges
  const PARAMETER_RANGES = {
    changepoint_prior_scale: [0.001, 0.005, 0.05, 0.1, 0.5],
    seasonality_prior_scale: [0.01, 0.1, 1.0, 5.0, 10.0],
    holidays_prior_scale: [0.01, 0.1, 1.0, 5.0, 10.0],
    seasonality_mode: ["additive", "multiplicative"],
    changepoint_range: [0.5, 0.6, 0.75, 0.9, 0.95],
  };

  // State for category and parameters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedParameters, setSelectedParameters] = useState([
    "changepoint_prior_scale",
    "seasonality_prior_scale",
    "seasonality_mode",
  ]);

  // State for grid search parameter options
  const [gridParameters, setGridParameters] = useState({
    changepoint_prior_scale: [0.001, 0.05, 0.5],
    seasonality_prior_scale: [0.01, 1.0, 10.0],
    holidays_prior_scale: [0.01, 1.0, 10.0],
    seasonality_mode: ["additive", "multiplicative"],
    changepoint_range: [0.75, 0.9],
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedParameters, setSavedParameters] = useState([]);

  // State for async tuning jobs
  const [tuningJobs, setTuningJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobPollingInterval, setJobPollingInterval] = useState(null);

  // Fetch available categories and jobs on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch categories
        const categoriesResponse = await fetch(
          `${baseUrl}/api/forecast/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setAvailableCategories(categoriesData.data || []);
        }

        // Fetch saved parameters
        const paramsResponse = await fetch(
          `${baseUrl}/api/forecast/parameters`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (paramsResponse.ok) {
          const paramsData = await paramsResponse.json();
          setSavedParameters(paramsData.data || []);
        }

        // Fetch tuning jobs
        await fetchTuningJobs();
      } catch (err) {
        setError("Failed to load data: " + err.message);
        showMessage("Failed to load initial data: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Clear any existing polling interval when component unmounts
    return () => {
      if (jobPollingInterval) {
        clearInterval(jobPollingInterval);
      }
    };
  }, [baseUrl, showMessage]);

  // Function to fetch tuning jobs
  const fetchTuningJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const jobsResponse = await fetch(`${baseUrl}/api/forecast/tuning_jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setTuningJobs(jobsData.data || []);

        // Check if there are any running jobs
        const runningJobs = (jobsData.data || []).filter(
          (job) => job.status === "running" || job.status === "pending"
        );

        if (runningJobs.length > 0) {
          // Set the active job ID to the most recent running job
          setActiveJobId(runningJobs[0].id);

          // Start polling if not already polling
          if (!jobPollingInterval) {
            startJobPolling();
          }
        }
      }
    } catch (err) {
      console.error("Error fetching tuning jobs:", err);
    }
  };

  // Function to poll job status
  const startJobPolling = () => {
    // Clear any existing interval first
    if (jobPollingInterval) {
      clearInterval(jobPollingInterval);
    }

    // Start a new polling interval
    const intervalId = setInterval(async () => {
      if (activeJobId) {
        await checkJobStatus(activeJobId);
      } else {
        // If no active job, stop polling
        clearInterval(intervalId);
        setJobPollingInterval(null);
      }
    }, 5000); // Poll every 5 seconds

    setJobPollingInterval(intervalId);
  };

  // Function to check job status
  const checkJobStatus = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/api/forecast/tuning_jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const job = data.data;

        // Update the jobs list with the current status
        setTuningJobs((prevJobs) =>
          prevJobs.map((j) => (j.id === jobId ? job : j))
        );

        // If job is completed or failed, stop polling and refresh parameters
        if (job.status === "completed" || job.status === "failed") {
          clearInterval(jobPollingInterval);
          setJobPollingInterval(null);
          setActiveJobId(null);

          // If completed, show success message and refresh parameters
          if (job.status === "completed") {
            showMessage(
              `Parameter tuning for '${job.category}' completed successfully!`,
              "success"
            );

            // Refresh saved parameters
            const paramsResponse = await fetch(
              `${baseUrl}/api/forecast/parameters`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (paramsResponse.ok) {
              const paramsData = await paramsResponse.json();
              setSavedParameters(paramsData.data || []);
            }
          } else if (job.status === "failed") {
            showMessage(
              `Parameter tuning failed: ${job.error || "Unknown error"}`,
              "error"
            );
          }
        }
      }
    } catch (err) {
      console.error("Error checking job status:", err);
    }
  };

  // Handle parameter selection toggle
  const toggleParameterSelection = (param) => {
    if (selectedParameters.includes(param)) {
      setSelectedParameters(selectedParameters.filter((p) => p !== param));
    } else {
      setSelectedParameters([...selectedParameters, param]);
    }
  };

  // Handle grid parameter toggle
  const toggleGridValue = (param, value) => {
    const currentValues = gridParameters[param] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setGridParameters({
      ...gridParameters,
      [param]: newValues,
    });
  };

  // Run parameter tuning
  const runParameterTuning = async () => {
    // Validate selections
    if (!categoryFilter) {
      showMessage("Please select a product category first", "error");
      return;
    }

    if (selectedParameters.length === 0) {
      showMessage("Please select at least one parameter to tune", "error");
      return;
    }

    // Verify we have values for each selected parameter
    const missingValues = selectedParameters.filter(
      (param) => !gridParameters[param] || gridParameters[param].length === 0
    );

    if (missingValues.length > 0) {
      showMessage(
        `Please select values for: ${missingValues.join(", ")}`,
        "error"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Prepare request body for grid search
      const requestBody = {
        category: categoryFilter,
        selected_parameters: selectedParameters,
        parameters: {},
      };

      // Add selected parameters and their values
      selectedParameters.forEach((param) => {
        requestBody.parameters[param] = gridParameters[param];
      });

      // Send request to start async tuning job
      const response = await fetch(`${baseUrl}/api/forecast/parameter_tuning`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Parameter tuning failed");
      }

      const result = await response.json();
      const jobId = result.data.job_id;

      // Set the active job ID and start polling
      setActiveJobId(jobId);

      // Fetch all jobs to update the list
      await fetchTuningJobs();

      // Start polling for job status
      startJobPolling();

      showMessage(
        "Parameter tuning job started. You can leave this page and check back later for results.",
        "success"
      );
    } catch (err) {
      setError("Tuning error: " + err.message);
      showMessage("Tuning error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete saved parameter
  const deleteParameter = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/forecast/parameters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete parameter");
      }

      // Update the saved parameters list
      setSavedParameters(savedParameters.filter((param) => param.id !== id));
      showMessage("Parameter configuration deleted successfully", "success");
    } catch (err) {
      showMessage("Error deleting parameter: " + err.message, "error");
    }
  };

  // Parameter description mapping
  const parameterDescriptions = {
    changepoint_prior_scale:
      "Controls flexibility in the trend (how much it can change). Lower values create smoother trends.",
    seasonality_prior_scale:
      "Controls flexibility of the seasonality. Higher values allow more fluctuation in seasonal patterns.",
    holidays_prior_scale:
      "Controls flexibility of holiday effects. Higher values make holidays more pronounced.",
    seasonality_mode:
      "Additive for constant seasonality patterns; multiplicative when seasonality changes with trend level.",
    changepoint_range:
      "Proportion of the history where trend changes can occur. Value of 0.9 means changepoints only in first 90% of the data.",
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    // Create a date object from the string
    const date = new Date(dateString);

    // Format the date in Makassar timezone (UTC+8)
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Makassar", // UTC+8 timezone for Makassar
    }).format(date);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">
          Forecast Parameter Tuning
        </h2>
        <p className="text-gray-600">
          Optimize your forecasting model by fine-tuning Prophet algorithm
          parameters. Select the category and parameters to test multiple
          configurations using grid search.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Active Job Status */}
      {activeJobId && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">
            Active Parameter Tuning Job
          </h3>

          {tuningJobs.find((job) => job.id === activeJobId) && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <div>
                  <span className="text-blue-700 font-medium">Category:</span>{" "}
                  {tuningJobs.find((job) => job.id === activeJobId).category}
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Started:</span>{" "}
                  {formatDate(
                    tuningJobs.find((job) => job.id === activeJobId).created_at
                  )}
                </div>
              </div>

              <div className="w-full bg-blue-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${
                      tuningJobs.find((job) => job.id === activeJobId)
                        .progress || 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 mt-1 text-right">
                {tuningJobs.find((job) => job.id === activeJobId).progress || 0}
                % Complete
              </p>
            </div>
          )}

          <p className="text-sm text-blue-700 mt-2">
            Parameter tuning is running in the background. You can leave this
            page and come back later to check results.
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Grid Search Configuration
        </h3>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Category <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
            disabled={loading || activeJobId !== null}
          >
            <option value="">Select a product category</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select the product category you want to optimize forecasting
            parameters for
          </p>
        </div>

        {/* Parameter Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parameters to Tune <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-2">
            {Object.keys(PARAMETER_RANGES).map((param) => (
              <div key={param} className="flex items-center">
                <input
                  type="checkbox"
                  id={`param-${param}`}
                  checked={selectedParameters.includes(param)}
                  onChange={() => toggleParameterSelection(param)}
                  className="mr-2 h-4 w-4"
                  disabled={loading || activeJobId !== null}
                />
                <label htmlFor={`param-${param}`} className="text-sm">
                  {param.replace(/_/g, " ")}
                </label>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Select the parameters you want to optimize. More parameters will
            increase tuning time but may improve accuracy.
          </div>
        </div>

        {/* Grid Search Values */}
        {selectedParameters.length > 0 && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-3">
              Grid Search Values
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Select multiple values to test for each parameter. The system will
              evaluate all combinations to find the optimal configuration.
            </p>

            {selectedParameters.includes("changepoint_prior_scale") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Changepoint Prior Scale
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARAMETER_RANGES.changepoint_prior_scale.map((value) => (
                    <label
                      key={value}
                      className="flex items-center border rounded-md px-2 py-1 bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={
                          gridParameters.changepoint_prior_scale?.includes(
                            value
                          ) || false
                        }
                        onChange={() =>
                          toggleGridValue("changepoint_prior_scale", value)
                        }
                        className="mr-1.5"
                        disabled={loading || activeJobId !== null}
                      />
                      <span className="text-sm">{value}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {parameterDescriptions.changepoint_prior_scale}
                </p>
              </div>
            )}

            {selectedParameters.includes("seasonality_prior_scale") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seasonality Prior Scale
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARAMETER_RANGES.seasonality_prior_scale.map((value) => (
                    <label
                      key={value}
                      className="flex items-center border rounded-md px-2 py-1 bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={
                          gridParameters.seasonality_prior_scale?.includes(
                            value
                          ) || false
                        }
                        onChange={() =>
                          toggleGridValue("seasonality_prior_scale", value)
                        }
                        className="mr-1.5"
                        disabled={loading || activeJobId !== null}
                      />
                      <span className="text-sm">{value}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {parameterDescriptions.seasonality_prior_scale}
                </p>
              </div>
            )}

            {selectedParameters.includes("holidays_prior_scale") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holidays Prior Scale
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARAMETER_RANGES.holidays_prior_scale.map((value) => (
                    <label
                      key={value}
                      className="flex items-center border rounded-md px-2 py-1 bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={
                          gridParameters.holidays_prior_scale?.includes(
                            value
                          ) || false
                        }
                        onChange={() =>
                          toggleGridValue("holidays_prior_scale", value)
                        }
                        className="mr-1.5"
                        disabled={loading || activeJobId !== null}
                      />
                      <span className="text-sm">{value}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {parameterDescriptions.holidays_prior_scale}
                </p>
              </div>
            )}

            {selectedParameters.includes("seasonality_mode") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seasonality Mode
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARAMETER_RANGES.seasonality_mode.map((value) => (
                    <label
                      key={value}
                      className="flex items-center border rounded-md px-2 py-1 bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={
                          gridParameters.seasonality_mode?.includes(value) ||
                          false
                        }
                        onChange={() =>
                          toggleGridValue("seasonality_mode", value)
                        }
                        className="mr-1.5"
                        disabled={loading || activeJobId !== null}
                      />
                      <span className="text-sm">{value}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {parameterDescriptions.seasonality_mode}
                </p>
              </div>
            )}

            {selectedParameters.includes("changepoint_range") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Changepoint Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARAMETER_RANGES.changepoint_range.map((value) => (
                    <label
                      key={value}
                      className="flex items-center border rounded-md px-2 py-1 bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={
                          gridParameters.changepoint_range?.includes(value) ||
                          false
                        }
                        onChange={() =>
                          toggleGridValue("changepoint_range", value)
                        }
                        className="mr-1.5"
                        disabled={loading || activeJobId !== null}
                      />
                      <span className="text-sm">{value}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {parameterDescriptions.changepoint_range}
                </p>
              </div>
            )}

            {/* Show combination count */}
            <div className="mt-4 text-sm text-gray-600">
              Total parameter combinations to test:{" "}
              {(() => {
                let count = 1;
                selectedParameters.forEach((param) => {
                  count *= gridParameters[param]?.length || 1;
                });
                return count;
              })()}
              {(() => {
                let count = 1;
                selectedParameters.forEach((param) => {
                  count *= gridParameters[param]?.length || 1;
                });
                return count > 20 ? (
                  <span className="text-amber-600 ml-2">
                    (This may take a while)
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        )}

        <button
          onClick={runParameterTuning}
          disabled={
            loading ||
            !categoryFilter ||
            selectedParameters.length === 0 ||
            activeJobId !== null
          }
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md transition duration-200 
            ${loading ? "bg-blue-400" : ""} 
            disabled:bg-blue-300 disabled:cursor-not-allowed flex justify-center items-center gap-2`}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Starting Parameter Tuning...</span>
            </>
          ) : activeJobId ? (
            "Tuning Job Already Running"
          ) : (
            "Run Parameter Tuning"
          )}
        </button>
      </div>

      {/* Job History */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center">
          <span>Tuning Job History</span>
          <button
            onClick={fetchTuningJobs}
            className="text-blue-500 hover:text-blue-700 text-sm hover:underline"
            disabled={loading}
          >
            Refresh
          </button>
        </h3>

        {tuningJobs.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No tuning jobs found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Run a parameter tuning job to see history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Progress</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {tuningJobs
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 border-t border-gray-100"
                    >
                      <td className="p-2">{job.id}</td>
                      <td className="p-2">{job.category}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {job.status === "running" ||
                        job.status === "pending" ? (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${job.progress || 0}%` }}
                            ></div>
                          </div>
                        ) : job.status === "completed" ? (
                          "100%"
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2">{formatDate(job.created_at)}</td>
                      <td className="p-2">
                        {job.status === "completed" && job.result ? (
                          <span className="text-green-600">
                            MAPE: {job.result.mape.toFixed(2)}%
                          </span>
                        ) : job.status === "failed" ? (
                          <span className="text-red-600">
                            Failed: {(job.error || "").substring(0, 30)}...
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saved Parameter Configurations */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">
          Saved Parameter Configurations
        </h3>

        {savedParameters.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No parameter configurations have been saved yet.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Run parameter tuning to optimize and save configurations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Category</th>
                  {/* Dynamic headers based on first parameter entry */}
                  {Object.keys(savedParameters[0].parameters).map((param) => (
                    <th key={param} className="p-2 text-left">
                      {param.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="p-2 text-left">MAPE (%)</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedParameters.map((param) => (
                  <tr
                    key={param.id}
                    className="hover:bg-gray-50 border-t border-gray-100"
                  >
                    <td className="p-2">{param.category}</td>
                    {/* Dynamic cells based on parameters */}
                    {Object.entries(param.parameters).map(([key, value]) => (
                      <td key={key} className="p-2">
                        {value}
                      </td>
                    ))}
                    <td className="p-2">{param.mape.toFixed(2)}%</td>
                    <td className="p-2">
                      {new Date(param.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => deleteParameter(param.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Parameter"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsOverlay;
