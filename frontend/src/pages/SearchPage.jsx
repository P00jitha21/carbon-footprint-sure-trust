import { useState } from "react";
import { Search, TrendingDown, AlertTriangle } from "lucide-react";
import { carbonAPI } from "../services/api";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.length < 2) return;

    setLoading(true);
    try {
      const data = await carbonAPI.searchProducts(query);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <Search className="h-20 w-20 text-primary-600 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          🔍 Product Search
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Check carbon footprint before you buy
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products... (e.g., 'beef', 'rice', 'milk')"
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 btn-primary px-6 py-2"
            disabled={loading || query.length < 2}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Results */}
      {results && (
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Found {results.total} products matching "{results.query}"
          </p>

          <div className="space-y-4">
            {results.results.map((product, index) => (
              <ProductSearchCard key={index} product={product} rank={index + 1} />
            ))}
          </div>

          {results.total === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try searching for common items like "chicken", "pasta", or "vegetables"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProductSearchCard = ({ product, rank }) => {
  const ratingConfig = {
    excellent: { color: "green", icon: "✅", text: "Excellent Choice" },
    good: { color: "blue", icon: "👍", text: "Good Choice" },
    moderate: { color: "orange", icon: "⚡", text: "Moderate Impact" },
    high: { color: "red", icon: "⚠️", text: "High Impact" },
  };

  const config = ratingConfig[product.rating];

  return (
    <div className="card hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-gray-400">#{rank}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {product.product_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className={`badge badge-${config.color} text-lg`}>
              {config.icon} {config.text}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Source: {product.source}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-3xl font-bold text-${config.color}-600`}>
            {product.carbon_kg.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">kg CO₂ / {product.unit}</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;