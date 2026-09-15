import { useState, useEffect } from "react";
import { X, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { carbonAPI } from "../services/api";

const RecommendationCard = ({ product, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [product]);

  const fetchRecommendations = async () => {
    try {
      const data = await carbonAPI.getRecommendations(
        product.product_name,
        product.carbon_kg,
      );
      setRecommendations(data);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError("Unable to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Green Alternatives
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">For: {product.product_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Product */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  Current Choice
                </p>
                <p className="text-lg font-bold text-red-900 dark:text-red-200">
                  {product.product_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  {product.carbon_kg.toFixed(2)} kg
                </p>
                <p className="text-sm text-red-800 dark:text-red-300">CO₂ Emissions</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Finding greener alternatives...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Recommendations */}
          {!loading && !error && recommendations.length > 0 && (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-lg p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Sparkles className="h-5 w-5 text-green-600" />
                        <h4 className="text-lg font-bold text-green-900 dark:text-green-200">
                          {rec.recommended_product}
                        </h4>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">{rec.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white dark:bg-gray-700 rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Carbon Saved</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        {rec.carbon_saved_kg.toFixed(2)} kg
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {rec.carbon_reduction_percent.toFixed(0)}% reduction
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">New Carbon</p>
                      </div>
                      <p className="text-xl font-bold text-blue-600">
                        {rec.carbon_kg.toFixed(2)} kg
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Per unit
                      </p>
                    </div>
                  </div>

                  {/* Visual Impact */}
                  <div className="mt-4 bg-white dark:bg-gray-700 rounded p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Impact Visualization
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
                          style={{ width: `${rec.carbon_reduction_percent}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        -{rec.carbon_reduction_percent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Recommendations */}
          {!loading && !error && recommendations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No lower-carbon alternatives found.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This product already has a relatively low carbon footprint!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;