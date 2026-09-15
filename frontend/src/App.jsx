import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AboutPage from "./pages/AboutPage";
import AchievementsPage from "./pages/AchievementsPage";
import MealPlanningPage from "./pages/MealPlanningPage";
import SearchPage from "./pages/SearchPage";
import { carbonAPI } from "./services/api";

function App() {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      await carbonAPI.healthCheck();
      setIsBackendOnline(true);
    } catch (error) {
      setIsBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              🌍
            </div>
          </div>
          <p className="text-gray-700 text-lg font-medium">
            Connecting to CarbonSight...
          </p>
        </div>
      </div>
    );
  }

  if (!isBackendOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="card max-w-md text-center shadow-2xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Backend Offline
          </h2>
          <p className="text-gray-700 mb-6">
            Unable to connect to the CarbonSight backend server.
          </p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-left font-mono text-sm mb-6">
            <div>cd backend</div>
            <div>python run.py</div>
          </div>
          <button onClick={checkBackend} className="btn-primary w-full">
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen dark:bg-gray-900">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/meal-planning" element={<MealPlanningPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>

        <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-xl font-semibold mb-2">🌍 CarbonSight</p>
              <p className="text-gray-400 text-sm">
                AI-Powered Carbon Footprint Tracker
              </p>
              <p className="text-gray-500 text-xs mt-3">
                Data sources: Poore & Nemecek (2018), Agribalyse 3.1, DEFRA, EPA USEEIO
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;