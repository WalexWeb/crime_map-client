import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import axios from "axios";
import { REGION_MOCK_DATA } from "@/data/region.data";
import { RegionInfoPanel } from "@/components/RegionInfoPanel";
import { RegionPrompt } from "@/components/RegionPrompt";
import { RegionalStatistics } from "@/components/RegionalStatistics";
import { useMapStore } from "@/stores/mapStore";
import type { ICrimeData } from "@/types/crime.type";

const API_URL = import.meta.env.VITE_API_URL;
// --- Цвета и метки для тепловой карты (статус готовности) ---
const HEATMAP_COLORS = ["#ef4444", "#10b981", "#f97316", "#9ca3af"];
const HEATMAP_HOVER_COLORS = ["#dc2626", "#059669", "#ea580c", "#6b7280"];
const HEATMAP_LABELS = [
  "Введено ВП",
  "Готов к введению (Соответствует требованиям к введению ВП)",
  "Отсутствуют институты государственной власти, обеспечивающие административно-правовой режим при ВП",
  "Нет информации",
];

const CRIME_LEVEL_COLORS = ["#10b981", "#84cc16", "#f59e0b", "#ef4444"];
const CRIME_LEVEL_LABELS = ["Низкая", "Средняя", "Высокая", "Очень высокая"];

const getCrimeLevel = (crimeRate: number): number => {
  if (crimeRate < 5000) return 0;
  if (crimeRate < 7000) return 1;
  if (crimeRate < 10000) return 2;
  return 3;
};

type RegionStatus = "no_info" | "ready" | "entered" | "possible";
const STATUS_MAP: Record<number, RegionStatus> = {
  0: "no_info",
  1: "ready",
  2: "entered",
  3: "possible",
};

const assignRandomHeatmapGroups = (
  regionIds: string[]
): Record<string, number> => {
  const groups: Record<string, number> = {};
  regionIds.forEach((id) => {
    groups[id] = Math.floor(Math.random() * HEATMAP_COLORS.length);
  });
  return groups;
};

// --- Вспомогательные функции для работы с SVG ---
const applyHeatmapColors = (
  states: NodeListOf<SVGPathElement>,
  groups: Record<string, number>
) => {
  states.forEach((state) => {
    if (groups[state.id] !== undefined) {
      state.style.fill = HEATMAP_COLORS[groups[state.id]];
    } else {
      state.style.fill = "#cbd5e1";
    }
    updateRegionTooltip(state, groups[state.id]);
  });
};

const applyCrimeModeColors = (
  states: NodeListOf<SVGPathElement>,
  crimeDataMap: Record<string, ICrimeData>
) => {
  states.forEach((state) => {
    const crimeData = crimeDataMap[state.id];
    if (crimeData) {
      const population = REGION_MOCK_DATA[state.id]?.population || 100000;
      const rate = Math.round((crimeData.total / population) * 100000);
      const level = getCrimeLevel(rate);
      state.style.fill = CRIME_LEVEL_COLORS[level];
    } else {
      state.style.fill = "#cbd5e1";
    }
    updateRegionTooltipCrime(state, crimeDataMap);
  });
};

const resetRegionColors = (states: NodeListOf<SVGPathElement>) => {
  states.forEach((state) => {
    state.style.fill = "#cbd5e1";
    const regionData = REGION_MOCK_DATA[state.id];
    if (regionData) {
      let tooltipContent = `<strong>${state.id}</strong><br/>Столица: ${regionData.capital}`;
      state.setAttribute("data-tooltip-html", tooltipContent);
    }
  });
};

const updateRegionTooltip = (
  state: SVGPathElement,
  groupIndex: number | undefined
) => {
  const regionData = REGION_MOCK_DATA[state.id];
  if (regionData) {
    let tooltipContent = `<strong>${state.id}</strong><br/>Столица: ${regionData.capital}`;
    if (groupIndex !== undefined) {
      const statusLabel = HEATMAP_LABELS[groupIndex] || "Неизвестно";
      tooltipContent += `<br/>Статус: ${statusLabel}`;
    }
    state.setAttribute("data-tooltip-html", tooltipContent);
  }
};

const updateRegionTooltipCrime = (
  state: SVGPathElement,
  crimeDataMap: Record<string, ICrimeData>
) => {
  const regionData = REGION_MOCK_DATA[state.id];
  if (regionData) {
    let tooltipContent = `<strong>${state.id}</strong><br/>Столица: ${regionData.capital}`;
    const crimeData = crimeDataMap[state.id];
    if (crimeData) {
      const population = regionData.population || 100000;
      const rate = Math.round((crimeData.total / population) * 100000);
      const level = getCrimeLevel(rate);
      const levelLabel = CRIME_LEVEL_LABELS[level];
      tooltipContent += `<br/>Уровень: ${levelLabel} (${rate} на 100к)`;
    }
    state.setAttribute("data-tooltip-html", tooltipContent);
  }
};
// --- Конец вспомогательных функций ---

export const InteractiveMapPage: React.FC = () => {
  const mapObjectRef = useRef<HTMLObjectElement>(null);

  const {
    isHeatmapEnabled,
    isCrimeModeEnabled,
    heatmapGroups,
    selectedRegionId,
    isLoading,
    viewMode,
    toggleHeatmap,
    toggleCrimeMode,
    setHeatmapGroups,
    setSelectedRegionId,
    setSelectedRegionStatus,
    setSelectedRegionCrimeData,
    setIsLoading,
    setViewMode,
  } = useMapStore();

  const selectedRegionData = selectedRegionId
    ? REGION_MOCK_DATA[selectedRegionId]
    : null;

  const [isSvgLoaded, setIsSvgLoaded] = useState(false);
  const [crimeDataMap, setCrimeDataMap] = useState<Record<string, ICrimeData>>(
    {}
  );

  // --- Загрузка данных о преступности ---
  useEffect(() => {
    const fetchCrimeData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<ICrimeData[]>(
          `${API_URL}/crimes/all`
        );
        const data = response.data;

        // Преобразуем массив в объект по полю region
        const map = data.reduce(
          (acc, item) => {
            acc[item.region] = item;
            return acc;
          },
          {} as Record<string, ICrimeData>
        );

        setCrimeDataMap(map);
        console.log("✅ Crime data loaded:", data.length, "regions");
      } catch (error) {
        console.error("❌ Failed to load crime data:", error);
        setCrimeDataMap({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrimeData();
  }, []); // Загружаем один раз при монтировании

  // --- Эффект для обновления цветов при изменении режимов или выбора региона ---
  useEffect(() => {
    if (!mapObjectRef.current?.contentDocument) return;
    const svg = mapObjectRef.current.contentDocument;
    const states = svg.querySelectorAll<SVGPathElement>(".state");

    states.forEach((state) => {
      if (selectedRegionId === state.id) return;

      let fillColor = "#cbd5e1";
      if (isHeatmapEnabled && heatmapGroups[state.id] !== undefined) {
        fillColor = HEATMAP_COLORS[heatmapGroups[state.id]];
      } else if (isCrimeModeEnabled && crimeDataMap[state.id] !== undefined) {
        const crimeData = crimeDataMap[state.id];
        const population = REGION_MOCK_DATA[state.id]?.population || 100000;
        const rate = Math.round((crimeData.total / population) * 100000);
        const level = getCrimeLevel(rate);
        fillColor = CRIME_LEVEL_COLORS[level];
      }
      state.style.fill = fillColor;
    });
  }, [
    selectedRegionId,
    isHeatmapEnabled,
    isCrimeModeEnabled,
    heatmapGroups,
    crimeDataMap,
  ]);

  // --- Основной эффект для инициализации и управления SVG ---
  useEffect(() => {
    const mapObject = mapObjectRef.current;
    if (!mapObject) return;

    let isComponentMounted = true;

    const handleLoad = () => {
      if (!isComponentMounted) return;
      console.log("✅ SVG loaded");
      setIsSvgLoaded(true);
      const svg = mapObject.contentDocument;
      if (!svg) return;

      const states = svg.querySelectorAll<SVGPathElement>(".state");
      console.log(`🗺️ Найдено регионов: ${states.length}`);

      if (isHeatmapEnabled) {
        applyHeatmapColors(states, heatmapGroups);
      } else if (isCrimeModeEnabled) {
        applyCrimeModeColors(states, crimeDataMap);
      } else {
        resetRegionColors(states);
      }

      const handleClick = (event: Event) => {
        const target = event.target as SVGPathElement;
        const regionId = target.id;
        console.log("🖱️ Клик по региону:", regionId);

        const regionData = REGION_MOCK_DATA[regionId];
        if (regionData) {
          setSelectedRegionId(regionId);

          if (isHeatmapEnabled && heatmapGroups[regionId] !== undefined) {
            const statusIndex = heatmapGroups[regionId];
            setSelectedRegionStatus(STATUS_MAP[statusIndex]);
            setSelectedRegionCrimeData(null);
          } else if (isCrimeModeEnabled) {
            const crimeData = crimeDataMap[regionId];
            if (crimeData) {
              console.log(`📌 Данные для региона "${regionId}":`, crimeData);
              setSelectedRegionCrimeData(crimeData);
              setSelectedRegionStatus(null);
            } else {
              console.warn(`⚠️ Данные не найдены для региона: ${regionId}`);
              setSelectedRegionCrimeData(null);
              setSelectedRegionStatus(null);
            }
          } else {
            setSelectedRegionStatus(null);
            setSelectedRegionCrimeData(null);
          }
        } else {
          setSelectedRegionId(regionId);
          setSelectedRegionStatus(null);
          setSelectedRegionCrimeData(null);
        }

        // Анимация выделения
        target.style.transform = "translateZ(7px) scale(1.025)";
        target.style.transition =
          "transform 0.3s ease-out, filter 0.3s ease-out";
        target.style.zIndex = "10";

        states.forEach((s) => {
          if (s.id !== regionId) {
            let resetColor = "#cbd5e1";
            if (isHeatmapEnabled && heatmapGroups[s.id] !== undefined) {
              resetColor = HEATMAP_COLORS[heatmapGroups[s.id]];
            } else if (isCrimeModeEnabled) {
              const data = crimeDataMap[s.id];
              if (data) {
                const pop = REGION_MOCK_DATA[s.id]?.population || 100000;
                const r = Math.round((data.total / pop) * 100000);
                const lvl = getCrimeLevel(r);
                resetColor = CRIME_LEVEL_COLORS[lvl];
              }
            }
            s.style.fill = resetColor;
            s.style.filter = "";
            s.style.transform = "";
            s.style.zIndex = "";
          } else {
            s.style.fill = "#2563eb";
            s.style.filter = "drop-shadow(0 0 6px rgba(37, 99, 235, 0.4))";
          }
        });
      };

      const handleMouseEnter = (event: Event) => {
        const target = event.target as SVGPathElement;
        const regionId = target.id.trim();
        if (!regionId) return;
        if (selectedRegionId === regionId) return;

        let hoverColor = "#3b82f6";
        if (isHeatmapEnabled) {
          if (heatmapGroups[regionId] !== undefined) {
            const groupIndex = heatmapGroups[regionId];
            hoverColor =
              HEATMAP_HOVER_COLORS[groupIndex] || HEATMAP_COLORS[groupIndex];
          }
        }

        target.style.fill = hoverColor;
        target.style.filter = "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))";
        target.style.transform = "translateZ(3px)";
        target.style.transition = "all 0.2s ease-out";
      };

      const handleMouseLeave = (event: Event) => {
        const target = event.target as SVGPathElement;
        const regionId = target.id;
        if (selectedRegionId === regionId) {
          target.style.fill = "#2563eb";
          target.style.filter = "drop-shadow(0 0 6px rgba(37, 99, 235, 0.4))";
          target.style.transform = "translateZ(3px) scale(1.03)";
        } else {
          let restoreColor = "#cbd5e1";
          if (isHeatmapEnabled && heatmapGroups[regionId] !== undefined) {
            restoreColor = HEATMAP_COLORS[heatmapGroups[regionId]];
          } else if (isCrimeModeEnabled) {
            const data = crimeDataMap[regionId];
            if (data) {
              const pop = REGION_MOCK_DATA[regionId]?.population || 100000;
              const r = Math.round((data.total / pop) * 100000);
              const lvl = getCrimeLevel(r);
              restoreColor = CRIME_LEVEL_COLORS[lvl];
            }
          }
          target.style.fill = restoreColor;
          target.style.filter = "";
          target.style.transform = "";
        }
      };

      states.forEach((state) => {
        state.style.cursor = "pointer";
        state.style.transition = "all 0.2s ease-out";

        const regionData = REGION_MOCK_DATA[state.id];
        if (regionData) {
          state.setAttribute("data-tooltip-id", "region-tooltip");
        }

        state.addEventListener("click", handleClick);
        state.addEventListener("mouseenter", handleMouseEnter);
        state.addEventListener("mouseleave", handleMouseLeave);
      });

      return () => {
        states.forEach((state) => {
          state.removeEventListener("click", handleClick);
          state.removeEventListener("mouseenter", handleMouseEnter);
          state.removeEventListener("mouseleave", handleMouseLeave);
        });
      };
    };

    if (
      mapObject.contentDocument &&
      mapObject.contentDocument.documentElement
    ) {
      const cleanup = handleLoad();
      return () => {
        isComponentMounted = false;
        cleanup && cleanup();
      };
    } else {
      mapObject.addEventListener("load", handleLoad);
    }

    return () => {
      isComponentMounted = false;
      mapObject.removeEventListener("load", handleLoad);
    };
  }, [
    isHeatmapEnabled,
    isCrimeModeEnabled,
    heatmapGroups,
    selectedRegionId,
    crimeDataMap,
  ]);

  // --- Обработчики кнопок ---
  const handleToggleHeatmap = () => {
    const newState = !isHeatmapEnabled;
    toggleHeatmap();
    if (newState && mapObjectRef.current?.contentDocument) {
      const svg = mapObjectRef.current.contentDocument;
      const states = svg.querySelectorAll<SVGPathElement>(".state");
      const ids = Array.from(states)
        .map((s) => s.id)
        .filter(Boolean);
      const newGroups = assignRandomHeatmapGroups(ids);
      setHeatmapGroups(newGroups);
      applyHeatmapColors(states, newGroups);
    } else if (!newState && mapObjectRef.current?.contentDocument) {
      const svg = mapObjectRef.current.contentDocument;
      const states = svg.querySelectorAll<SVGPathElement>(".state");
      resetRegionColors(states);
    }
  };

  const handleToggleCrimeMode = () => {
    const newState = !isCrimeModeEnabled;
    toggleCrimeMode();
    if (newState && mapObjectRef.current?.contentDocument) {
      const svg = mapObjectRef.current.contentDocument;
      const states = svg.querySelectorAll<SVGPathElement>(".state");
      applyCrimeModeColors(states, crimeDataMap);
    } else if (!newState && mapObjectRef.current?.contentDocument) {
      const svg = mapObjectRef.current.contentDocument;
      const states = svg.querySelectorAll<SVGPathElement>(".state");
      resetRegionColors(states);
    }
  };

  const handleResetSelection = () => {
    if (mapObjectRef.current?.contentDocument) {
      const svg = mapObjectRef.current.contentDocument;
      const states = svg.querySelectorAll<SVGPathElement>(".state");

      states.forEach((state) => {
        state.style.transform = "";
        state.style.transition =
          "transform 0.3s ease-out, filter 0.3s ease-out";
        state.style.zIndex = "";

        let restoreColor = "#cbd5e1";
        if (isHeatmapEnabled && heatmapGroups[state.id] !== undefined) {
          restoreColor = HEATMAP_COLORS[heatmapGroups[state.id]];
        } else if (isCrimeModeEnabled) {
          const data = crimeDataMap[state.id];
          if (data) {
            const pop = REGION_MOCK_DATA[state.id]?.population || 100000;
            const r = Math.round((data.total / pop) * 100000);
            const lvl = getCrimeLevel(r);
            restoreColor = CRIME_LEVEL_COLORS[lvl];
          }
        }
        state.style.fill = restoreColor;
        state.style.filter = "";
      });
    }

    setSelectedRegionId(null);
    setSelectedRegionStatus(null);
    setSelectedRegionCrimeData(null);
  };

  useEffect(() => {
    if (isSvgLoaded) {
      setIsLoading(false);
    }
  }, [isSvgLoaded]);

  // --- Рендер ---
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

          <button
            onClick={handleToggleHeatmap}
            disabled={isCrimeModeEnabled}
            className={`px-4 py-2 md:px-5 md:py-2 rounded-lg font-medium transition-all text-sm md:text-base flex items-center gap-2 shadow-sm border ${
              isHeatmapEnabled
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
            } ${isCrimeModeEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
            Статус регионов
          </button>

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
                </motion.div>
                <Tooltip id="region-tooltip" place="top" />
              </div>

              {isHeatmapEnabled && (
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
              )}

              {isCrimeModeEnabled && (
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
              )}
            </div>
          )}

          <div
            className={`${
              viewMode === "map"
                ? "lg:w-[350px] xl:w-1/4 flex-shrink-0"
                : "w-full"
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
