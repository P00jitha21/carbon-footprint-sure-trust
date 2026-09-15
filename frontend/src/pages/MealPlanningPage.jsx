import { useState, useEffect } from "react";
import { ChefHat, Calendar, ShoppingCart } from "lucide-react";
import { carbonAPI } from "../services/api";

const MealPlanningPage = () => {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: '',
    meal_type: '',
    max_carbon: 1.0,
    difficulty: ''
  });

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await carbonAPI.getRecipes(filters);
      setRecipes(data);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const plan = await carbonAPI.generateWeeklyMealPlan(3.0, filters.cuisine);
      setWeeklyPlan(plan);
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateShoppingList = async () => {
    if (!weeklyPlan) return;
    
    const recipeIds = weeklyPlan.flatMap(day => [
      day.breakfast?.id,
      day.lunch?.id,
      day.dinner?.id
    ]).filter(Boolean).join(',');
    
    try {
      const list = await carbonAPI.getShoppingList(recipeIds);
      downloadShoppingList(list);
    } catch (error) {
      console.error("Failed to generate shopping list:", error);
    }
  };

  const downloadShoppingList = (list) => {
    const text = `SHOPPING LIST - CarbonSight\n\n` +
      list.shopping_list.map(item => 
        `☐ ${item.ingredient_name}: ${item.amount} ${item.unit} (${item.carbon_kg.toFixed(2)}kg CO₂)`
      ).join('\n') +
      `\n\nTotal Carbon: ${list.total_carbon_kg.toFixed(2)}kg CO₂`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carbonsight-shopping-list.txt';
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <ChefHat className="h-20 w-20 text-primary-600 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          🍽️ Low-Carbon Meal Planner
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Delicious recipes that are good for you and the planet
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button onClick={generateMealPlan} className="btn-primary flex items-center gap-2" disabled={loading}>
          <Calendar className="h-5 w-5" />
          Generate 7-Day Plan
        </button>
        {weeklyPlan && (
          <button onClick={generateShoppingList} className="btn-secondary flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Download Shopping List
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.cuisine}
            onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Cuisines</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Indian">Indian</option>
            <option value="Mexican">Mexican</option>
            <option value="Italian">Italian</option>
            <option value="American">American</option>
          </select>

          <select
            value={filters.meal_type}
            onChange={(e) => setFilters({...filters, meal_type: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Max Carbon: {filters.max_carbon}kg</label>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={filters.max_carbon}
              onChange={(e) => setFilters({...filters, max_carbon: parseFloat(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Weekly Meal Plan */}
      {weeklyPlan && (
        <div className="card bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <Calendar className="h-8 w-8 text-primary-600" />
            Your 7-Day Meal Plan
          </h2>

          <div className="space-y-4">
            {weeklyPlan.map((day, idx) => (
              <DayPlanCard key={idx} day={day} onRecipeClick={setSelectedRecipe} />
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-6 bg-white dark:bg-gray-700 rounded-lg">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Weekly Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {weeklyPlan.reduce((sum, day) => sum + day.total_carbon_kg, 0).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total kg CO₂</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {(weeklyPlan.reduce((sum, day) => sum + day.total_calories, 0) / 7).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Calories/Day</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {(weeklyPlan.reduce((sum, day) => sum + day.total_carbon_kg, 0) / 7).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg kg CO₂/Day</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      {!weeklyPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

const DayPlanCard = ({ day, onRecipeClick }) => {
  const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
  
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dayName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{day.date}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">{day.total_carbon_kg.toFixed(2)} kg</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">CO₂</p>
        </div>
      </div>

      <div className="space-y-3">
        {['breakfast', 'lunch', 'dinner'].map(meal => {
          const recipe = day[meal];
          if (!recipe) return null;
          
          return (
            <div
              key={meal}
              onClick={() => onRecipeClick(recipe)}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer transition-all"
            >
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{meal}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{recipe.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  {recipe.carbon_per_serving.toFixed(2)} kg
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{recipe.calories_per_serving} cal</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
        {recipe.carbon_per_serving.toFixed(2)} kg CO₂
      </div>

      <div className="text-6xl mb-4">
        {recipe.meal_type === 'breakfast' ? '🍳' : 
         recipe.meal_type === 'lunch' ? '🥗' : '🍲'}
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
        {recipe.name}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {recipe.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>⏱️ {recipe.prep_time_minutes} min</span>
        <span>🍽️ {recipe.servings} servings</span>
        <span className={`badge ${
          recipe.difficulty === 'easy' ? 'badge-success' : 
          recipe.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
        }`}>
          {recipe.difficulty}
        </span>
      </div>
    </div>
  );
};

const RecipeModal = ({ recipe, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{recipe.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{recipe.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {recipe.carbon_per_serving.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">kg CO₂/serving</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {recipe.calories_per_serving}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">calories</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {recipe.prep_time_minutes}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">minutes</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {recipe.protein_g.toFixed(0)}g
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">protein</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Ingredients</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      • {ing.amount} {ing.unit} {ing.ingredient_name}
                    </span>
                    <span className="text-sm text-green-600">
                      {ing.carbon_kg.toFixed(3)} kg CO₂
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Instructions</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
                {recipe.instructions}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanningPage;