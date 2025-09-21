import {
  CRIME_LEVEL_COLORS,
  CRIME_LEVEL_LABELS,
  HEATMAP_COLORS,
  HEATMAP_LABELS,
} from "@/utils/mapUtils";
import React from "react";

interface MapLegendsProps {
  isHeatmapEnabled: boolean;
  isCrimeModeEnabled: boolean;
}

export const MapLegends = React.memo(
  ({ isHeatmapEnabled, isCrimeModeEnabled }: MapLegendsProps) => {
    if (isHeatmapEnabled) {
      return (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mt-3 self-start">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Статус регионов:
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {HEATMAP_COLORS.map((color, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-sm border border-gray-300"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs text-gray-600">
                  {HEATMAP_LABELS[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (isCrimeModeEnabled) {
      return (
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mt-3 self-start">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Уровень преступности:
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {CRIME_LEVEL_COLORS.map((color, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-sm border border-gray-300"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs text-gray-600">
                  {CRIME_LEVEL_LABELS[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }
);
