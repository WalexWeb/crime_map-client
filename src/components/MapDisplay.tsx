import React, { type RefObject } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { useMapStore } from "@/stores/mapStore";

interface MapDisplayProps {
  mapObjectRef: RefObject<HTMLObjectElement | null>;
  isLoading: boolean;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({
  mapObjectRef,
  isLoading,
}) => {
  const { isHeatmapEnabled } = useMapStore();

  return (
    <div className="relative bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex-grow flex flex-col">
      {isLoading && (
        <motion.div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full relative flex-grow"
      >
        <object
          ref={mapObjectRef}
          id="map"
          data="/map.svg"
          type="image/svg+xml"
          className="w-full h-full min-h-0 rounded-lg"
          aria-label="Карта регионов"
        />
        <Tooltip id="region-tooltip" place="top" />
      </motion.div>

      {/* Легенды — как в оригинале */}
      {isHeatmapEnabled && (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mt-3 self-start">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Статус регионов:
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {["#ef4444", "#10b981", "#f97316", "#9ca3af"].map(
              (color, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-sm border border-gray-300"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    [ "Введено ВП", "Готов к введению", "Отсутствуют институты",
                    "Нет информации", ][index]
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
