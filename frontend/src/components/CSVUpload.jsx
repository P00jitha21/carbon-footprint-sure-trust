import { useState } from "react";
import { carbonAPI } from "../services/api";

const CSVUpload = ({ onResults }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const transactions = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      const transaction = {};

      headers.forEach((header, index) => {
        transaction[header] = values[index]?.trim();
      });

      transactions.push({
        date: transaction.date || transaction.Date || "",
        description:
          transaction.description ||
          transaction.Description ||
          transaction.merchant ||
          "",
        amount: parseFloat(transaction.amount || transaction.Amount || 0),
      });
    }

    return transactions;
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const transactions = parseCSV(text);
      const results = await carbonAPI.uploadCSV(transactions);
      onResults(results);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">📊</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quick Mode: Upload CSV
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload bank transaction CSV for instant analysis
          </p>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-300 dark:border-gray-600"}
          ${file ? "bg-green-50 dark:bg-green-900/20 border-green-500" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
          id="csv-upload"
        />

        {!file ? (
          <>
            <div className="text-6xl mb-4">📤</div>
            <label htmlFor="csv-upload" className="cursor-pointer">
              <span className="text-primary-600 font-medium hover:text-primary-700">
                Click to upload
              </span>
              <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              CSV file with columns: date, description, amount
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✅</div>
            <p className="text-green-700 dark:text-green-400 font-medium">{file.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-600 hover:text-red-700 mt-2"
            >
              Remove
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* CSV Format Helper */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Expected CSV Format:</h4>
        <pre className="text-sm text-blue-800 dark:text-blue-400 bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto">
          {`date,description,amount
2024-01-15,WHOLE FOODS MKT,87.43
2024-01-16,SHELL OIL 1234,45.00
2024-01-17,STARBUCKS,12.50`}
        </pre>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="btn-primary w-full mt-6"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </span>
        ) : (
          "Calculate Carbon Footprint"
        )}
      </button>
    </div>
  );
};

export default CSVUpload;