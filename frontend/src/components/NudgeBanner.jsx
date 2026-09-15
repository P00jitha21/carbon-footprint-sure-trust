import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";
import { carbonAPI } from "../services/api";

const NudgeBanner = () => {
  const [nudge, setNudge] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchNudge();
    const interval = setInterval(fetchNudge, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNudge = async () => {
    try {
      const data = await carbonAPI.getNudge(5, 0);
      setNudge(data);
      setVisible(true);
    } catch (error) {
      console.error("Failed to fetch nudge:", error);
    }
  };

  const handleClose = async () => {
    if (nudge) {
      await carbonAPI.submitNudgeFeedback(nudge.nudge_type, false);
    }
    setVisible(false);
  };

  const handleClick = async () => {
    if (nudge) {
      await carbonAPI.submitNudgeFeedback(nudge.nudge_type, true);
    }
    setVisible(false);
  };

  if (!visible || !nudge) return null;

  const bgColors = {
    tip: "bg-blue-100 dark:bg-blue-900/30 border-blue-500",
    quiz: "bg-purple-100 dark:bg-purple-900/30 border-purple-500",
    challenge: "bg-orange-100 dark:bg-orange-900/30 border-orange-500",
    summary: "bg-green-100 dark:bg-green-900/30 border-green-500",
  };

  const textColors = {
    tip: "text-blue-800 dark:text-blue-300",
    quiz: "text-purple-800 dark:text-purple-300",
    challenge: "text-orange-800 dark:text-orange-300",
    summary: "text-green-800 dark:text-green-300",
  };

  return (
    <div
      className={`
        ${bgColors[nudge.nudge_type] || "bg-gray-100 border-gray-500"}
        border-l-4 p-4 mx-4 mt-4 rounded-lg shadow-md
        animate-slide-down cursor-pointer
      `}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Lightbulb
            className={`h-6 w-6 ${textColors[nudge.nudge_type] || "text-gray-800"} mt-0.5`}
          />
          <div>
            <p
              className={`font-medium ${textColors[nudge.nudge_type] || "text-gray-800"}`}
            >
              {nudge.message}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Click to learn more</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NudgeBanner;