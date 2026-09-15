import { useState } from "react";
import CSVUpload from "../components/CSVUpload";
import ReceiptUpload from "../components/ReceiptUpload";
import ResultsDisplay from "../components/ResultsDisplay";

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState("receipt");
  const [csvResults, setCsvResults] = useState(null);
  const [receiptResults, setReceiptResults] = useState(null);

  const handleCSVResults = (data) => {
    setCsvResults(data);
    setReceiptResults(null);
  };

  const handleReceiptResults = (data) => {
    setReceiptResults(data);
    setCsvResults(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          📤 Upload Your Data
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Choose Quick Mode (CSV) or Deep Mode (Receipt) for carbon analysis
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex justify-center space-x-4 mb-8 animate-slide-up">
        <button
          onClick={() => {
            setActiveTab("csv");
            setReceiptResults(null);
          }}
          className={`
            flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform
            ${
              activeTab === "csv"
                ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg hover:scale-105"
            }
          `}
        >
          <span className="text-2xl">📊</span>
          <span>Quick Mode (CSV)</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("receipt");
            setCsvResults(null);
          }}
          className={`
            flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform
            ${
              activeTab === "receipt"
                ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg hover:scale-105"
            }
          `}
        >
          <span className="text-2xl">📸</span>
          <span>Deep Mode (Receipt)</span>
        </button>
      </div>

      {/* Upload Components */}
      <div className="animate-slide-up">
        {activeTab === "csv" ? (
          <CSVUpload onResults={handleCSVResults} />
        ) : (
          <ReceiptUpload onResults={handleReceiptResults} />
        )}
      </div>

      {/* Results Display */}
      {(csvResults || receiptResults) && (
        <ResultsDisplay csvData={csvResults} receiptData={receiptResults} />
      )}
    </div>
  );
};

export default UploadPage;