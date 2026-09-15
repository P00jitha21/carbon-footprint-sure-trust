import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { carbonAPI } from "../services/api";
import NudgeBanner from "../components/NudgeBanner";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await carbonAPI.getSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalCarbon = summary?.total_carbon_kg || 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Nudge Banner */}
      <NudgeBanner />

      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to <span className="text-primary-600">CarbonSight</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Your AI-powered personal carbon footprint coach
        </p>
        <Link to="/upload" className="btn-primary inline-block">
          📤 Upload Receipt or CSV
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
        <StatCard
          title="Total Scans"
          value={summary?.total_scans || 0}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Total Carbon"
          value={`${totalCarbon.toFixed(2)} kg`}
          icon="🌍"
          color="green"
        />
        <StatCard
          title="Avg per Scan"
          value={`${summary?.avg_carbon_per_scan?.toFixed(2) || 0} kg`}
          icon="📊"
          color="purple"
        />
        <StatCard
          title="Receipt Scans"
          value={summary?.receipt_scans || 0}
          icon="📸"
          color="orange"
        />
      </div>

      {/* Carbon Goal Tracker */}
      {summary && summary.total_scans > 0 && (
        <div className="mb-12 animate-slide-up">
          <GoalTracker currentCarbon={totalCarbon} monthlyGoal={100} />
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
        <FeatureCard
          title="Quick Mode"
          description="Upload bank CSV for instant spend-based estimates"
          icon="📊"
          to="/upload"
        />
        <FeatureCard
          title="Deep Mode"
          description="Scan receipts for precise item-level footprints"
          icon="📸"
          to="/upload"
        />
        <FeatureCard
          title="AI Insights"
          description="Get personalized green alternatives"
          icon="🤖"
          to="/analytics"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/meal-planning" className="card hover:shadow-xl transition-all group">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🍽️</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                Meal Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get low-carbon recipes and weekly meal plans
              </p>
            </div>
          </div>
        </Link>

        <Link to="/search" className="card hover:shadow-xl transition-all group">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🔍</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                Product Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check carbon footprint before you buy
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div
        className={`inline-block p-3 rounded-lg ${colors[color]} mb-4 text-2xl`}
      >
        {icon}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
    </div>
  );
};

const FeatureCard = ({ title, description, icon, to }) => {
  return (
    <Link
      to={to}
      className="card hover:shadow-xl transition-all hover:scale-105"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
};

const GoalTracker = ({ currentCarbon, monthlyGoal = 100 }) => {
  const progress = (currentCarbon / monthlyGoal) * 100;
  const remaining = Math.max(monthlyGoal - currentCarbon, 0);
  const isOverGoal = currentCarbon > monthlyGoal;

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🎯 Monthly Goal</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Edit Goal
        </button>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(progress / 100, 1))}`}
              className={`transition-all duration-1000 ${
                isOverGoal ? "text-red-500" : "text-green-500"
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.min(progress, 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">of goal</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentCarbon.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Current (kg CO₂)</p>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
          <p className={`text-2xl font-bold ${isOverGoal ? "text-red-600" : "text-green-600"}`}>
            {isOverGoal ? "+" : ""}{(currentCarbon - monthlyGoal).toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isOverGoal ? "Over Goal" : "Remaining"}
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
          {isOverGoal ? (
            <>⚠️ You've exceeded your monthly goal. Consider greener choices!</>
          ) : remaining < 10 ? (
            <>🎉 Almost there! {remaining.toFixed(1)} kg remaining</>
          ) : (
            <>💪 Keep it up! {remaining.toFixed(1)} kg budget left</>
          )}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;