import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapDisplay } from "@/components/MapDisplay";
import { RegionInfoPanel } from "@/components/RegionInfoPanel";
import { RegionPrompt } from "@/components/RegionPrompt";
import { RegionalStatistics } from "@/components/RegionalStatistics";
import { useMapStore } from "@/stores/mapStore";
import { useCrimeData } from "@/hooks/useCrimeData";
import { useMapSVG } from "@/hooks/useMapSVG";
import { MapLegends } from "@/components/MapLegend";
import { REGION_MOCK_DATA } from "@/data/region.data";
import { getCrimeLevelColor, HEATMAP_COLORS } from "@/utils/mapUtils";
import { applyCrimeModeColors, resetRegionColors } from "@/utils/svgUtils";

export const InteractiveMapPage: React.FC = () => {
  const mapObjectRef = useRef<HTMLObjectElement | null>(null);

  const {
    viewMode,
    setViewMode,
    isCrimeModeEnabled,
    toggleCrimeMode,
    selectedRegionId,
    setIsLoading,
    isHeatmapEnabled,
  } = useMapStore();

  const { crimeDataMap, isLoading: crimeDataLoading } = useCrimeData();
  const [isSvgLoaded, setIsSvgLoaded] = useState(false);

  // Подключаем логику SVG
  useMapSVG(mapObjectRef, crimeDataMap, isSvgLoaded, setIsSvgLoaded);

  // Синхронизация глобального isLoading
  useEffect(() => {
    setIsLoading(crimeDataLoading || !isSvgLoaded);
  }, [crimeDataLoading, isSvgLoaded, setIsLoading]);

  const selectedRegionData = selectedRegionId
    ? REGION_MOCK_DATA[selectedRegionId]
    : null;

  const handleResetSelection = () => {
    if (mapObjectRef.current?.contentDocument) {
      const svg = mapObjectRef.current.contentDocument;
      const states = svg.querySelectorAll<SVGPathElement>(".state");

      states.forEach((state) => {
        state.style.transform = "translate(0, 0) scale(1)";
        state.style.filter = "";
        state.style.zIndex = "1";

        let restoreColor = "#cbd5e1";
        if (
          useMapStore.getState().isHeatmapEnabled &&
          useMapStore.getState().heatmapGroups[state.id] !== undefined
        ) {
          restoreColor =
            HEATMAP_COLORS[useMapStore.getState().heatmapGroups[state.id]];
        } else if (isCrimeModeEnabled) {
          const data = crimeDataMap[state.id];
          if (data) {
            const pop = REGION_MOCK_DATA[state.id]?.population || 100000;
            restoreColor = getCrimeLevelColor(data.total, pop);
          }
        }
        state.style.fill = restoreColor;
      });
    }

    useMapStore.getState().setSelectedRegionId(null);
    useMapStore.getState().setSelectedRegionStatus(null);
    useMapStore.getState().setSelectedRegionCrimeData(null);
  };

  // ✅ Добавляем обработчик переключения режима преступности — КАК В ОРИГИНАЛЕ
  const handleToggleCrimeMode = () => {
    const newState = !isCrimeModeEnabled;
    toggleCrimeMode(); // Переключаем состояние в сторе

    if (!mapObjectRef.current?.contentDocument) return;

    const svg = mapObjectRef.current.contentDocument;
    const states = svg.querySelectorAll<SVGPathElement>(".state");

    if (newState) {
      // Включаем режим — применяем цвета преступности
      applyCrimeModeColors(states, crimeDataMap);
    } else {
      // Выключаем режим — сбрасываем цвета
      resetRegionColors(states);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-50 text-gray-900 p-4 md:p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-8xl mx-auto relative z-10 h-full flex flex-col"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800">
            Интерактивная карта регионов
          </h1>
          <p className="text-center text-gray-500 mt-1 md:mt-2 text-sm md:text-base">
            Изучите статистику и особенности регионов
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-6">
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

          {/* ✅ Кнопка переключения режима преступности — КАК В ОРИГИНАЛЕ */}
          <button
            onClick={handleToggleCrimeMode}
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
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 flex-grow overflow-hidden">
          {viewMode === "map" && (
            <div className="flex flex-col flex-grow overflow-hidden">
              <MapDisplay
                mapObjectRef={mapObjectRef}
                isLoading={crimeDataLoading || !isSvgLoaded}
              />
              <MapLegends
                isHeatmapEnabled={false}
                isCrimeModeEnabled={isCrimeModeEnabled}
              />
            </div>
          )}

          <div
            className={`${
              viewMode === "map"
                ? "lg:w-[350px] xl:w-1/4 flex-shrink-0"
                : "w-full overflow-y-auto"
            }`}
          >
            <AnimatePresence mode="wait">
              {viewMode === "map" ? (
                selectedRegionData ? (
                  <RegionInfoPanel
                    region={selectedRegionData}
                    onReset={handleResetSelection}
                  />
                ) : (
                  <RegionPrompt />
                )
              ) : (
                <RegionalStatistics />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
