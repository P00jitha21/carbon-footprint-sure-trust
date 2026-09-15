import { useState, useEffect } from "react";
import { Factory, Package, Truck, Store, Sprout } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { carbonAPI } from "../services/api";

const STAGE_ICONS = {
  'Production': Sprout,
  'Processing': Factory,
  'Packaging': Package,
  'Transport': Truck,
  'Retail': Store
};

const STAGE_COLORS = {
  'Production': '#10b981',
  'Processing': '#f59e0b',
  'Packaging': '#8b5cf6',
  'Transport': '#ef4444',
  'Retail': '#3b82f6'
};

const SupplyChainViz = ({ productName, onClose }) => {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('pie');

  useEffect(() => {
    fetchBreakdown();
  }, [productName]);

  const fetchBreakdown = async () => {
    try {
      const data = await carbonAPI.getSupplyChainBreakdown(productName);
      setBreakdown(data);
    } catch (error) {
      console.error("Failed to fetch supply chain data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="card text-center">
        <p className="text-gray-600 dark:text-gray-400">No supply chain data available</p>
      </div>
    );
  }

  const chartData = breakdown.stages.map(stage => ({
    name: stage.stage,
    value: stage.carbon_kg,
    percentage: stage.percentage,
    color: STAGE_COLORS[stage.stage]
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            🔍 Supply Chain Carbon Breakdown
          </h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
              ✕
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{breakdown.product_name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Total Carbon Footprint: <span className="font-bold text-2xl text-red-600">
                {breakdown.total_carbon_kg.toFixed(2)} kg CO₂
              </span>
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('pie')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'pie' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              🥧 Pie Chart
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'bar' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              📊 Bar Chart
            </button>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="card">
        <h3 className="text-xl font-bold mb-6 dark:text-white">Carbon by Supply Chain Stage</h3>
        
        {viewMode === 'pie' ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(3)} kg CO₂`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value.toFixed(3)} kg CO₂`} />
              <Legend />
              <Bar dataKey="value" name="Carbon Emissions">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed Stage Breakdown */}
      <div className="card">
        <h3 className="text-xl font-bold mb-6 dark:text-white">Stage-by-Stage Analysis</h3>
        <div className="space-y-4">
          {breakdown.stages.map((stage, index) => {
            const Icon = STAGE_ICONS[stage.stage];
            const color = STAGE_COLORS[stage.stage];
            
            return (
              <div
                key={index}
                className="border-l-4 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 transition-all"
                style={{ borderColor: color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      {Icon && <Icon className="h-6 w-6" style={{ color }} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {stage.icon} {stage.stage}
                        </h4>
                        <span className="badge badge-info">
                          {stage.percentage}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {stage.description}
                      </p>
                      
                      {stage.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📍 Origin: {stage.location}
                        </p>
                      )}
                      
                      {stage.distance_km && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📏 Distance: {stage.distance_km.toFixed(0)} km
                        </p>
                      )}
                      
                      {/* Progress bar */}
                      <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-1000"
                          style={{
                            width: `${stage.percentage}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold" style={{ color }}>
                      {stage.carbon_kg.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">kg CO₂</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {breakdown.recommendations && breakdown.recommendations.length > 0 && (
        <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
          <h3 className="text-xl font-bold mb-4 text-green-900 dark:text-green-300 flex items-center gap-2">
            💡 How to Reduce Impact
          </h3>
          
          <div className="space-y-3">
            {breakdown.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
              >
                <span className="text-2xl">{idx === 0 ? '💡' : idx === 1 ? '🌱' : '♻️'}</span>
                <p className="text-gray-700 dark:text-gray-300 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChainViz;