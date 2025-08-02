import { useEffect, type RefObject } from "react";
import { useMapStore } from "@/stores/mapStore";

export const useMapInteractions = (
  mapObjectRef: RefObject<HTMLObjectElement | null>
  // selectedRegion, setSelectedRegion, setIsLoading - больше не передаются
) => {
  // Получаем состояние режимов из хранилища
  const { isHeatmapEnabled, isCrimeModeEnabled, heatmapGroups } = useMapStore();

  useEffect(() => {
    const mapObject = mapObjectRef.current;
    if (!mapObject) return;

    const handleLoad = () => {
      // setIsLoading(false); // Управление загрузкой должно быть в основном компоненте
      const svg = mapObject.contentDocument;
      if (!svg) return;

      const states = svg.querySelectorAll<SVGPathElement>(".state");

      // Устанавливаем базовые стили и курсор
      states.forEach((state) => {
        state.style.cursor = "pointer";
        state.style.transition = "all 0.2s ease-out";
        // Начальный цвет устанавливается в основном компоненте
        state.style.fill = "#cbd5e1";
      });

      // Обработчики для базовых эффектов наведения
      // (Основная логика кликов и выбора находится в основном компоненте)
      const handleMouseEnter = (event: Event) => {
        const target = event.target as SVGPathElement;
        // Базовый hover эффект, цвет будет меняться в основном компоненте в зависимости от режима
        // Здесь можно добавить, например, тень или scale, если нужно
        target.style.filter = "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))";
      };

      const handleMouseLeave = (event: Event) => {
        const target = event.target as SVGPathElement;
        // Сброс базового hover эффекта
        target.style.filter = "";
      };

      states.forEach((state) => {
        state.addEventListener("mouseenter", handleMouseEnter);
        state.addEventListener("mouseleave", handleMouseLeave);

        // Очистка слушателей
        return () => {
          state.removeEventListener("mouseenter", handleMouseEnter);
          state.removeEventListener("mouseleave", handleMouseLeave);
          // Клик-обработчики удаляются в основном компоненте
        };
      });
    };

    // --- Исправление: Проверяем, загружен ли SVG сразу ---
    if (mapObject.contentDocument) {
      handleLoad();
    } else {
      mapObject.addEventListener("load", handleLoad);

      return () => {
        mapObject.removeEventListener("load", handleLoad);
      };
    }
    // --- Конец исправления ---
  }, [isHeatmapEnabled, isCrimeModeEnabled, heatmapGroups]); // Зависимости от режимов
};
