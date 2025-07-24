import { useEffect, type RefObject } from "react";
import type { IRegionData } from "@/types/region.type";

export const useMapInteractions = (
  mapObjectRef: RefObject<HTMLObjectElement>,
  selectedRegion: IRegionData | null,
  setSelectedRegion: (region: IRegionData | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    const mapObject = mapObjectRef.current;
    if (!mapObject) return;

    const handleLoad = () => {
      setIsLoading(false);
      const svg = mapObject.contentDocument;
      if (!svg) return;

      const states = svg.querySelectorAll<SVGPathElement>(".state");
      states.forEach((state) => {
        state.style.cursor = "pointer";
        state.style.transition = "all 0.2s ease-out";
        state.style.fill = "#cbd5e1";

        const handleMouseEnter = () => {
          if (selectedRegion?.name !== state.id) {
            state.style.fill = "#3b82f6";
            state.style.filter = "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))";
          }
        };

        const handleMouseLeave = () => {
          if (selectedRegion?.name !== state.id) {
            state.style.fill = "#cbd5e1";
            state.style.filter = "";
          }
        };

        const handleClick = () => {
          setSelectedRegion({ name: state.id });
          states.forEach((s) => {
            s.style.fill = "#cbd5e1";
            s.style.filter = "";
          });
          state.style.fill = "#2563eb";
          state.style.filter = "drop-shadow(0 0 6px rgba(37, 99, 235, 0.4))";
        };

        state.addEventListener("mouseenter", handleMouseEnter);
        state.addEventListener("mouseleave", handleMouseLeave);
        state.addEventListener("click", handleClick);

        // Очистка слушателей при размонтировании или изменении зависимостей
        return () => {
          state.removeEventListener("mouseenter", handleMouseEnter);
          state.removeEventListener("mouseleave", handleMouseLeave);
          state.removeEventListener("click", handleClick);
        };
      });
    };

    mapObject.addEventListener("load", handleLoad);

    // Очистка слушателя события load
    return () => {
      mapObject.removeEventListener("load", handleLoad);
    };
  }, [selectedRegion, setSelectedRegion, setIsLoading]); // Зависимости
};
