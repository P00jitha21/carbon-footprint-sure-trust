import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    config.params = { ...config.params, _t: Date.now() };
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export const carbonAPI = {
  // CSV Upload
  uploadCSV: async (transactions) => {
    const response = await api.post("/upload/csv", { transactions });
    return response.data;
  },

  // Receipt Upload (extended timeout)
  uploadReceipt: async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    const response = await api.post("/upload/receipt", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 180000, // 3 minutes for receipt processing
    });
    return response.data;
  },

  // Recommendations
  getRecommendations: async (productName, currentCarbon) => {
    const response = await api.post("/recommendations", {
      product_name: productName,
      current_carbon_kg: currentCarbon,
    });
    return response.data;
  },

  // Nudges
  getNudge: async (recentScans = 0, ignoredNudges = 0) => {
    const response = await api.get("/nudge", {
      params: { recent_scans: recentScans, ignored_nudges: ignoredNudges },
    });
    return response.data;
  },

  submitNudgeFeedback: async (nudgeType, clicked, actionTaken = false) => {
    const response = await api.post("/nudge/feedback", null, {
      params: { nudge_type: nudgeType, clicked, action_taken: actionTaken },
    });
    return response.data;
  },

  // Analytics
  getSummary: async () => {
    const response = await api.get("/analytics/summary");
    return response.data;
  },

  getCategoryBreakdown: async () => {
    const response = await api.get("/analytics/category-breakdown");
    return response.data;
  },

  getTimeline: async (days = 30) => {
    const response = await api.get("/analytics/timeline", { params: { days } });
    return response.data;
  },

  getUniqueProducts: async (page = 1, pageSize = 10) => {
    const response = await api.get("/analytics/unique-products", {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  getTopProducts: async (limit = 10) => {
    const response = await api.get("/analytics/top-products", {
      params: { limit },
    });
    return response.data;
  },

  // Supply Chain
  getSupplyChainBreakdown: async (productName) => {
    const response = await api.get(`/supply-chain/${encodeURIComponent(productName)}`);
    return response.data;
  },

  // Meal Planning
  getRecipes: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.meal_type) params.append('meal_type', filters.meal_type);
    if (filters.max_carbon) params.append('max_carbon', filters.max_carbon);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.max_prep_time) params.append('max_prep_time', filters.max_prep_time);
    
    const response = await api.get(`/recipes?${params}`);
    return response.data;
  },

  generateWeeklyMealPlan: async (targetCarbon = 3.0, cuisines = null) => {
    const params = { target_carbon_per_day: targetCarbon };
    if (cuisines) params.cuisines = cuisines;
    
    const response = await api.get('/meal-plan/weekly', { params });
    return response.data;
  },

  getShoppingList: async (recipeIds) => {
    const response = await api.get('/meal-plan/shopping-list', {
      params: { recipe_ids: recipeIds }
    });
    return response.data;
  },

  // Predictions
  getPredictions: async () => {
    const response = await api.get('/predictions/monthly');
    return response.data;
  },

  getBudgetSuggestion: async () => {
    const response = await api.get('/predictions/budget');
    return response.data;
  },

  // Achievements
  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },

  // Search
  searchProducts: async (query) => {
    const response = await api.get('/search', { params: { query } });
    return response.data;
  },

  // Health Check
  healthCheck: async () => {
    const response = await axios.get("http://localhost:8000/health", {
      timeout: 5000,
    });
    return response.data;
  },
};

export default api;