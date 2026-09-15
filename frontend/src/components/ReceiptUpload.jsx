import { useState, useEffect } from "react";
import { carbonAPI } from "../services/api";

const ReceiptUpload = ({ onResults }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      setProcessingTime(0);
      interval = setInterval(() => {
        setProcessingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const results = await carbonAPI.uploadReceipt(file);
      onResults(results);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-3xl">📸</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Deep Mode: Upload Receipt
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload receipt photo for item-level analysis
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
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="receipt-upload"
        />

        {!file ? (
          <>
            <div className="text-6xl mb-4">📷</div>
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <span className="text-primary-600 font-medium hover:text-primary-700">
                Click to upload
              </span>
              <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
            </label>
            <p className="text-sm text-gray-500 mt-2">JPG, PNG (max 10MB)</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✅</div>
            <p className="text-green-700 dark:text-green-400 font-medium">{file.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="text-sm text-red-600 hover:text-red-700 mt-2"
            >
              Remove
            </button>
          </>
        )}
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview:</h4>
          <img
            src={preview}
            alt="Receipt"
            className="max-h-96 mx-auto rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">📸 Photo Tips:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Use good lighting</li>
          <li>• Keep receipt flat and fully visible</li>
          <li>• Avoid shadows and glare</li>
        </ul>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="btn-primary w-full mt-6"
      >
        {loading ? (
          <span className="flex items-center justify-center flex-col gap-2">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing... {processingTime}s elapsed
            </div>
            <span className="text-xs opacity-75">
              This may take up to 3 minutes
            </span>
          </span>
        ) : (
          "Analyze Receipt"
        )}
      </button>
    </div>
  );
};

export default ReceiptUpload;