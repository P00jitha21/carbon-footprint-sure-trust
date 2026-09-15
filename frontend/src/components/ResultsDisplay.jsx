import { useState } from "react";
import SupplyChainViz from "./SupplyChainViz";
import { Eye } from "lucide-react";

const ResultsDisplay = ({ csvData, receiptData }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSupplyChain, setShowSupplyChain] = useState(false);

  const data = receiptData || csvData;
  if (!data) return null;

  const isReceipt = !!receiptData;

  // Calculate equivalents
  const treesNeeded = ((data.total_carbon_kg / 21) * 365).toFixed(1);
  const carDaysEquivalent = (data.total_carbon_kg / (4600 / 365)).toFixed(1);
  const flightsEquivalent = (data.total_carbon_kg / 90).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Summary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-primary-600 to-blue-600 text-white p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            🎉 Analysis Complete!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-2">🌍</div>
              <p className="text-4xl font-bold">
                {data.total_carbon_kg.toFixed(2)} kg
              </p>
              <p className="text-green-100 text-sm">CO₂ Emissions</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-4xl font-bold">
                {isReceipt ? data.products?.length : data.transactions?.length}
              </p>
              <p className="text-green-100 text-sm">
                {isReceipt ? "Products" : "Transactions"}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-2">🌳</div>
              <p className="text-4xl font-bold">{treesNeeded}</p>
              <p className="text-green-100 text-sm">Tree-Days to Offset</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <span className="text-2xl">🚗</span>
              <div>
                <p className="font-semibold">Equivalent to driving</p>
                <p className="text-green-100 text-sm">
                  {carDaysEquivalent} days in a car
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <span className="text-2xl">✈️</span>
              <div>
                <p className="font-semibold">Equivalent to</p>
                <p className="text-green-100 text-sm">
                  {flightsEquivalent} short-haul flights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Mode: Products Table */}
      {isReceipt && data.products && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📋 Item-Level Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Click on items to see supply chain breakdown
              </p>
            </div>
            {data.processing_time_ms && (
              <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                ⚡ {data.processing_time_ms.toFixed(0)}ms
              </span>
            )}
          </div>

          {data.products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">
                No products detected in this receipt
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Carbon Impact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Match Quality
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.products.map((product, index) => (
                    <tr key={index} className="table-row-hover group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                              {product.product_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.carbon_kg > 10
                                ? "⚠️ High carbon"
                                : product.carbon_kg > 5
                                  ? "⚡ Moderate"
                                  : "✅ Low impact"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ×{product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          ${product.price?.toFixed(2) || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`
                            text-lg font-bold
                            ${
                              product.carbon_kg > 10
                                ? "text-red-600"
                                : product.carbon_kg > 5
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }
                          `}
                          >
                            {product.carbon_kg.toFixed(2)} kg
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                product.carbon_kg > 10
                                  ? "bg-red-500"
                                  : product.carbon_kg > 5
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min((product.carbon_kg / 20) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`
                          px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1
                          ${
                            product.match_type === "exact"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : product.match_type === "fuzzy"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : product.match_type === "keyword"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                  : product.match_type === "category"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }
                        `}
                        >
                          {product.match_type} ({product.confidence.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product.product_name);
                            setShowSupplyChain(true);
                          }}
                          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View Chain
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OCR Text */}
          {data.raw_text && (
            <details className="mt-6 group">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="group-open:rotate-90 transition-transform">
                  ▶
                </span>
                View Raw OCR Text
              </summary>
              <pre className="mt-3 p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">
                {data.raw_text}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* CSV Mode: Transactions Table */}
      {!isReceipt && csvData && csvData.transactions && (
        <div className="card animate-slide-up">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            💳 Transaction Analysis
          </h3>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Carbon
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {csvData.transactions.map((txn, index) => (
                  <tr key={index} className="table-row-hover group">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {txn.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {txn.description}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-info">{txn.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        ${txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`
                        text-lg font-bold
                        ${
                          txn.carbon_kg > 50
                            ? "text-red-600"
                            : txn.carbon_kg > 20
                              ? "text-orange-600"
                              : "text-green-600"
                        }
                      `}
                      >
                        {txn.carbon_kg.toFixed(2)} kg
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supply Chain Modal */}
      {showSupplyChain && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <SupplyChainViz 
              productName={selectedProduct} 
              onClose={() => {
                setShowSupplyChain(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;