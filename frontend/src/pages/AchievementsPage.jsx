import { useState, useEffect } from "react";
import { Trophy, Lock, Star } from "lucide-react";
import { carbonAPI } from "../services/api";
import confetti from "canvas-confetti";

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const data = await carbonAPI.getAchievements();
      setAchievements(data);
      
      if (data.unlocked.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!achievements) {
    return <div className="text-center py-20">
      <p className="text-gray-600 dark:text-gray-400">Failed to load achievements</p>
    </div>;
  }

  const progress = achievements
    ? (achievements.total_unlocked / achievements.total_achievements) * 100
    : 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          🏆 Achievements
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {achievements.total_unlocked} of {achievements.total_achievements} unlocked
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto mt-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{progress.toFixed(0)}% Complete</p>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          ✨ Unlocked ({achievements.unlocked.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.unlocked.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} unlocked={true} />
          ))}
        </div>
      </div>

      {/* Locked Achievements */}
      <div>
        <h2 className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-6">
          🔒 Locked ({achievements.locked.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.locked.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} unlocked={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AchievementCard = ({ achievement, unlocked }) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-6 transition-all duration-300
        ${
          unlocked
            ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 shadow-lg hover:shadow-xl transform hover:scale-105"
            : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 opacity-60"
        }
      `}
    >
      {/* Icon */}
      <div className="text-6xl mb-4 text-center">
        {unlocked ? achievement.icon : "🔒"}
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        {achievement.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {achievement.description}
      </p>

      {/* Unlocked Badge */}
      {unlocked && (
        <div className="absolute top-2 right-2">
          <Star className="h-6 w-6 text-yellow-500 fill-current" />
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;