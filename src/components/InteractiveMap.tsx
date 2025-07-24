import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewModeToggle } from "./ViewModeToggle";
import { MapDisplay } from "./MapDisplay";
import { RegionInfoPanel } from "./RegionInfoPanel";
import { RegionPrompt } from "./RegionPrompt";
import { RegionalStatistics } from "./RegionalStatistics";
import "react-tooltip/dist/react-tooltip.css";
import type { IRegionData } from "@/types/region.type";
import { useMapInteractions } from "@/hooks/useMapInteractions";

export default function InteractiveMapPage() {
  const mapObjectRef = useRef<HTMLObjectElement>(null!) as React.RefObject<HTMLObjectElement>;
  const [selectedRegion, setSelectedRegion] = useState<IRegionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"map" | "stats">("map");

  // Подключение пользовательского хука
  useMapInteractions(mapObjectRef, selectedRegion, setSelectedRegion, setIsLoading);

  return (
    <div className="h-screen w-screen bg-gray-50 text-gray-900 p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto relative z-10 h-full flex flex-col"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800">
            Интерактивная карта регионов
          </h1>
          <p className="text-center text-gray-500 mt-2">
            Изучите статистику и особенности регионов
          </p>
        </motion.div>

        {/* Переключатель режимов */}
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

        <div className="flex flex-col lg:flex-row gap-6 flex-grow">
          {viewMode === "map" && <MapDisplay mapObjectRef={mapObjectRef} isLoading={isLoading} />}

          <div className={viewMode === "map" ? "lg:w-1/4" : "w-full"}>
            <AnimatePresence mode="wait">
              {viewMode === "map" ? (
                selectedRegion ? (
                  <RegionInfoPanel
                    region={selectedRegion}
                    onReset={() => setSelectedRegion(null)}
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
}