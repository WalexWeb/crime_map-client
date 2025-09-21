import React from "react";
import { motion } from "framer-motion";
import { useMapStore } from "@/stores/mapStore";

interface MapControlPanelProps {
  onCrimeModeToggle: () => void;
  viewMode: "map" | "stats";
  setViewMode: (mode: "map" | "stats") => void;
}

export const MapControlPanel: React.FC<MapControlPanelProps> = ({
  onCrimeModeToggle,
  viewMode,
  setViewMode,
}) => {
  const { isHeatmapEnabled, isCrimeModeEnabled } = useMapStore();

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-6">
      {/* Переключатель режима: Карта / Статистика */}
      <div className="bg-white border border-gray-200 p-1 rounded-xl inline-flex shadow-sm">
        <button
          onClick={() => setViewMode("map")}
          className={`px-4 py-2 md:px-5 md:py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
            viewMode === "map"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Карта
        </button>
        <button
          onClick={() => setViewMode("stats")}
          className={`px-4 py-2 md:px-5 md:py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
            viewMode === "stats"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Статистика
        </button>
      </div>

      {/* Кнопка переключения криминогенного режима */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCrimeModeToggle}
        disabled={isHeatmapEnabled}
        className={`px-4 py-2 md:px-5 md:py-2 rounded-lg font-medium transition-all text-sm md:text-base flex items-center gap-2 shadow-sm border ${
          isCrimeModeEnabled
            ? "bg-red-500 hover:bg-red-600 text-white border-red-600"
            : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
        } ${isHeatmapEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Криминогенная обстановка
      </motion.button>
    </div>
  );
};