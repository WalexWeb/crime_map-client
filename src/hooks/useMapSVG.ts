import { useEffect } from "react";
import { REGION_MOCK_DATA } from "@/data/region.data";
import type { ICrimeData } from "@/types/crime.type";
import { useMapStore } from "@/stores/mapStore";
import {
  CRIME_LEVEL_LABELS,
  HEATMAP_COLORS,
  HEATMAP_HOVER_COLORS,
  HEATMAP_LABELS,
} from "@/utils/mapUtils";


const getCrimeLevel = (crimeRate: number): number => {
  if (crimeRate < 5000) return 0;
  if (crimeRate < 7000) return 1;
  if (crimeRate < 10000) return 2;
  return 3;
};

const getCrimeLevelColor = (crimes: number, population: number): string => {
  if (!population) return "#d1d5db";
  const crimesPer100k = (crimes / population) * 100000;
  const level = getCrimeLevel(crimesPer100k);
  const colorMap = ["#22c55e", "#eab308", "#f97316", "#ef4444"];
  return colorMap[level] || "#d1d5db";
};

type RegionStatus = "no_info" | "ready" | "entered" | "possible";
const STATUS_MAP: Record<number, RegionStatus> = {
  0: "no_info",
  1: "ready",
  2: "entered",
  3: "possible",
};

// --- Вспомогательные функции ---
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
    const region = REGION_MOCK_DATA[state.id];
    if (crimeData && region) {
      const fillColor = getCrimeLevelColor(
        crimeData.total,
        region.population || 1
      );
      state.style.fill = fillColor;
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

// --- Основной хук ---
export const useMapSVG = (
  mapObjectRef: React.RefObject<HTMLObjectElement | null>,
  crimeDataMap: Record<string, ICrimeData>,
  // @ts-ignore
  isSvgLoaded: boolean,
  setIsSvgLoaded: (loaded: boolean) => void
) => {
  const {
    isHeatmapEnabled,
    isCrimeModeEnabled,
    heatmapGroups,
    selectedRegionId,
    setSelectedRegionId,
    setSelectedRegionStatus,
    setSelectedRegionCrimeData,
  } = useMapStore();

  // Обработчик загрузки SVG
  useEffect(() => {
    const mapObject = mapObjectRef.current;
    if (!mapObject) return;

    let isComponentMounted = true;

    const handleLoad = () => {
      if (!isComponentMounted) return;
      setIsSvgLoaded(true);
      const svg = mapObject.contentDocument;
      if (!svg) return;

      const states = svg.querySelectorAll<SVGPathElement>(".state");

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
              setSelectedRegionCrimeData(crimeData);
              setSelectedRegionStatus(null);
            } else {
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
        target.style.transform = "translate(-8px, -8px) scale(1.03)";
        target.style.transition =
          "transform 0.3s ease-out, filter 0.3s ease-out";
        target.style.zIndex = "1000";
        target.style.filter = "drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))";

        states.forEach((s) => {
          if (s.id !== regionId) {
            let resetColor = "#cbd5e1";
            if (isHeatmapEnabled && heatmapGroups[s.id] !== undefined) {
              resetColor = HEATMAP_COLORS[heatmapGroups[s.id]];
            } else if (isCrimeModeEnabled) {
              const data = crimeDataMap[s.id];
              if (data) {
                const pop = REGION_MOCK_DATA[s.id]?.population || 100000;
                resetColor = getCrimeLevelColor(data.total, pop);
              }
            }
            s.style.fill = resetColor;
            s.style.filter = "";
            s.style.transform = "translate(0, 0) scale(1)";
            s.style.zIndex = "1";
          } else {
            s.style.fill = "#2563eb";
            s.style.filter = "drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))";
            s.style.transform = "translate(-8px, -8px) scale(1.03)";
            s.style.zIndex = "1000";
          }
        });
      };

      const handleMouseEnter = (event: Event) => {
        const target = event.target as SVGPathElement;
        const regionId = target.id.trim();
        if (!regionId || selectedRegionId === regionId) return;

        let hoverColor = "#3b82f6";
        if (isHeatmapEnabled && heatmapGroups[regionId] !== undefined) {
          const groupIndex = heatmapGroups[regionId];
          hoverColor =
            HEATMAP_HOVER_COLORS[groupIndex] || HEATMAP_COLORS[groupIndex];
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
          target.style.filter = "drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))";
          target.style.transform = "translate(-8px, -8px) scale(1.03)";
          target.style.zIndex = "1000";
        } else {
          let restoreColor = "#cbd5e1";
          if (isHeatmapEnabled && heatmapGroups[regionId] !== undefined) {
            restoreColor = HEATMAP_COLORS[heatmapGroups[regionId]];
          } else if (isCrimeModeEnabled) {
            const data = crimeDataMap[regionId];
            if (data) {
              const pop = REGION_MOCK_DATA[regionId]?.population || 100000;
              restoreColor = getCrimeLevelColor(data.total, pop);
            }
          }
          target.style.fill = restoreColor;
          target.style.filter = "";
          target.style.transform = "translate(0, 0) scale(1)";
          target.style.zIndex = "1";
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
    setIsSvgLoaded,
  ]);

  // Обновление цветов при изменении состояния (без перезагрузки SVG)
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
        fillColor = getCrimeLevelColor(crimeData.total, population);
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
};
