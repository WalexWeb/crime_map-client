import { REGION_MOCK_DATA } from "@/data/region.data";
import type { ICrimeData } from "@/types/crime.type";
import { getCrimeLevelColor } from "./mapUtils";

export const applyCrimeModeColors = (
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
  });
};

export const resetRegionColors = (states: NodeListOf<SVGPathElement>) => {
  states.forEach((state) => {
    state.style.fill = "#cbd5e1";
    const regionData = REGION_MOCK_DATA[state.id];
    if (regionData) {
      let tooltipContent = `<strong>${state.id}</strong><br/>Столица: ${regionData.capital}`;
      state.setAttribute("data-tooltip-html", tooltipContent);
    }
  });
};
