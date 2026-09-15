import { useState, useEffect } from "react";
import { carbonAPI } from "../services/api";
import Pagination from "../components/Pagination";
import CarbonPieChart from "../components/CarbonPieChart";
import CarbonTimelineChart from "../components/CarbonTimelineChart";
import ExportButton from "../components/ExportButton";

const AnalyticsPage = () => {
  const [categoryData, setCategoryData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryRes, timelineRes, summaryRes] = await Promise.all([
        carbonAPI.getCategoryBreakdown().catch(() => ({ categories: {} })),
        carbonAPI.getTimeline(timeRange).catch(() => ({ timeline: [] })),
        carbonAPI.getSummary().catch(() => ({})),
      ]);

      setCategoryData(categoryRes);
      setTimelineData(timelineRes);
      setSummary(summaryRes);
    } catch (err) {
      console.error("Analytics error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await carbonAPI.getUniqueProducts(currentPage, pageSize);
      setProductsData(data);
    } catch (err) {
      console.error("Products error:", err);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <div className="card bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
          <div className="text-6xl mb-4 text-center">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
            Error Loading Analytics
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-4">{error}</p>
          <button onClick={fetchAllData} className="btn-primary w-full">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Analytics <span className="text-primary-600">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Real-time insights from your {summary?.total_scans || 0} scans
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAllData} className="btn-secondary" title="Refresh data">
            🔄 Refresh
          </button>
          <ExportButton
            summary={summary || {}}
            products={productsData?.items || []}
            categories={categoryData?.categories || {}}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon="📦"
          title="Total Scans"
          value={summary?.total_scans || 0}
          subtitle={`${summary?.csv_scans || 0} CSV • ${summary?.receipt_scans || 0} Receipts`}
          gradient="from-blue-500 to-blue-600"
        />
        <SummaryCard
          icon="🌍"
          title="Total Emissions"
          value={`${(summary?.total_carbon_kg || 0).toFixed(1)} kg`}
          subtitle={`≈ ${((summary?.total_carbon_kg || 0) / 1000).toFixed(2)} tons CO₂`}
          gradient="from-red-500 to-red-600"
        />
        <SummaryCard
          icon="📈"
          title="Average per Scan"
          value={`${(summary?.avg_carbon_per_scan || 0).toFixed(1)} kg`}
          subtitle="Per shopping session"
          gradient="from-orange-500 to-orange-600"
        />
        <SummaryCard
          icon="💰"
          title="Unique Products"
          value={productsData?.total || 0}
          subtitle={`Across ${Object.keys(categoryData?.categories || {}).length} categories`}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        {categoryData?.categories && Object.keys(categoryData.categories).length > 0 && (
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🥧 Carbon by Category
            </h3>
            <CarbonPieChart data={categoryData.categories} />
          </div>
        )}

        {/* Timeline Chart */}
        {timelineData?.timeline && timelineData.timeline.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                📈 Carbon Timeline
              </h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <CarbonTimelineChart data={timelineData.timeline} />
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔝 Carbon Impact by Product
          </h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {productsData?.items && productsData.items.length > 0 ? (
          <>
            <div className="space-y-3">
              {productsData.items.map((product, index) => {
                const globalRank = (currentPage - 1) * pageSize + index + 1;
                return (
                  <ProductCard
                    key={`${product.product_name}-${index}`}
                    product={product}
                    rank={globalRank}
                  />
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={productsData.total_pages}
              onPageChange={handlePageChange}
              totalItems={productsData.total}
              pageSize={pageSize}
            />
          </>
        ) : (
          <EmptyState message="No product data yet" icon="📦" />
        )}
      </div>

      {/* Insights */}
      {summary && summary.total_scans > 0 && (
        <div className="card bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            💡 Smart Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightCard
              icon="📊"
              text={`Tracked ${summary.total_scans} purchases totaling ${(summary.total_carbon_kg || 0).toFixed(1)} kg CO₂`}
              color="blue"
            />
            <InsightCard
              icon="🌳"
              text={`Requires ${(((summary.total_carbon_kg || 0) / 21) * 365).toFixed(0)} tree-days to offset`}
              color="green"
            />
            <InsightCard
              icon="🎯"
              text={`${productsData?.total || 0} unique products across ${Object.keys(categoryData?.categories || {}).length} categories`}
              color="purple"
            />
            <InsightCard
              icon="⭐"
              text={`Average ${(summary.avg_carbon_per_scan || 0).toFixed(1)} kg CO₂ per session`}
              color="orange"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!summary || summary.total_scans === 0) && (
        <div className="card text-center bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
          <div className="text-8xl mb-6">📊</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Data Yet!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Upload receipts or CSVs to see insights
          </p>
          <a href="/upload" className="btn-primary inline-block">
            📤 Upload Now
          </a>
        </div>
      )}
    </div>
  );
};

// Component helpers
const SummaryCard = ({ icon, title, value, subtitle, gradient }) => (
  <div className={`stat-card bg-gradient-to-br ${gradient} relative overflow-hidden`}>
    <div className="absolute top-0 right-0 text-9xl opacity-10">{icon}</div>
    <div className="relative z-10">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-white/90 text-sm font-medium mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-4xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
    </div>
  </div>
);

const ProductCard = ({ product, rank }) => {
  const carbonValue = product?.carbon_kg || 0;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 transition-all duration-300 group cursor-pointer transform hover:scale-[1.02] hover:shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex flex-col items-center justify-center min-w-[3rem] h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold shadow-md">
          #{rank}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors text-lg">
              {product.product_name}
            </p>
            <span className={`badge ${
              product.match_type === "exact" ? "badge-success" :
              product.match_type === "fuzzy" ? "badge-info" : "badge-warning"
            }`}>
              {product.match_type}
            </span>
            {product.count > 1 && (
              <span className="badge badge-info">
                ×{product.count} purchases
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((carbonValue / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last: {new Date(product.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className={`text-2xl font-bold ${
          carbonValue > 20 ? "text-red-600" :
          carbonValue > 10 ? "text-orange-600" : "text-green-600"
        }`}>
          {carbonValue.toFixed(2)} kg
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {carbonValue > 20 ? "⚠️ High" :
           carbonValue > 10 ? "⚡ Moderate" : "✅ Low"}
        </p>
      </div>
    </div>
  );
};

const InsightCard = ({ icon, text, color }) => {
  const colors = {
    blue: "from-blue-400 to-blue-500",
    green: "from-green-400 to-green-500",
    purple: "from-purple-400 to-purple-500",
    orange: "from-orange-400 to-orange-500",
  };

  return (
    <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all group">
      <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
        {icon}
      </div>
      <p className="text-gray-700 dark:text-gray-300 flex-1 pt-2">{text}</p>
    </div>
  );
};

const EmptyState = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-8xl mb-6 opacity-50">{icon}</div>
    <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">{message}</p>
    <a href="/upload" className="btn-primary mt-6">
      📤 Upload Data
    </a>
  </div>
);

export default AnalyticsPage;