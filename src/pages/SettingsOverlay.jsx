import React, { useState } from "react";
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
    icon,
    description,
    file,
    setFile,
    onImport,
    type,
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-100 p-2 rounded-full text-blue-700">
          {icon || "📄"}
        </div>
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
              <p className="text-center text-gray-500 mt-2">
                Pilih file atau drag & drop di sini
              </p>
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
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md transition duration-200 
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
          <div className="bg-blue-100 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-700"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Import Data</h1>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center transition duration-200"
          aria-label="Close Settings"
        >
          ×
        </button>
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
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Data Import
          </h2>
          <p className="text-gray-600">
            Upload files below to import your data. We support .xlsx, .xls, and
            .csv formats.
          </p>
        </div>

        {/* Grid layout for import forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImportForm
            title="Transaction Data"
            icon="💼"
            description="Import transaction history including orders, sales, and payments."
            file={transactionFile}
            setFile={setTransactionFile}
            onImport={handleImportTransaction}
            type="Transaction"
          />

          <ImportForm
            title="Product Data"
            icon="📦"
            description="Import product catalog with details like name, price, and category."
            file={productFile}
            setFile={setProductFile}
            onImport={handleImportProduct}
            type="Product"
          />

          <ImportForm
            title="Customer Data"
            icon="👥"
            description="Import customer information including contacts and preferences."
            file={customerFile}
            setFile={setCustomerFile}
            onImport={handleImportCustomer}
            type="Customer"
          />

          <ImportForm
            title="Product Stock Data"
            icon="🏬"
            description="Import inventory levels and stock movement data."
            file={productStockFile}
            setFile={setProductStockFile}
            onImport={handleImportProductStock}
            type="ProductStock"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
