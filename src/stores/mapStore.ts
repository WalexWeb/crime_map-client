import type { ICrimeData } from "@/types/crime.type";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type RegionStatus = "no_info" | "ready" | "entered" | "possible";

// Интерфейс состояния
interface MapState {
  // Режимы отображения
  isHeatmapEnabled: boolean;
  isCrimeModeEnabled: boolean;
  // Данные для режимов
  heatmapGroups: Record<string, number>;
  // Выбранный регион и его данные
  selectedRegionId: string | null;
  selectedRegionStatus: RegionStatus | null;
  selectedRegionCrimeData: ICrimeData | null;
  // Состояние загрузки
  isLoading: boolean;
  // Режим отображения (карта/статистика)
  viewMode: "map" | "stats";

  // Действия
  toggleHeatmap: () => void;
  toggleCrimeMode: () => void;
  setHeatmapGroups: (groups: Record<string, number>) => void;
  setSelectedRegionId: (id: string | null) => void;
  setSelectedRegionStatus: (status: RegionStatus | null) => void;
  setSelectedRegionCrimeData: (data: ICrimeData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setViewMode: (mode: "map" | "stats") => void;
  resetModesAndSelection: () => void;
  // Действие для гидрации (восстановления) состояния из localStorage
  hydrate: () => void;
}

// Определяем, какие части состояния нужно сохранять
const PERSISTED_KEYS: (keyof MapState)[] = [
  "isHeatmapEnabled",
  "isCrimeModeEnabled",
  "heatmapGroups",
  "viewMode",
];

export const useMapStore = create<MapState>()(
  // Применяем middleware persist
  persist(
    (set) => ({
      // Состояния по умолчанию
      isHeatmapEnabled: false,
      isCrimeModeEnabled: false,
      heatmapGroups: {},
      selectedRegionId: null,
      selectedRegionStatus: null,
      selectedRegionCrimeData: null,
      isLoading: true,
      viewMode: "map",

      // Действия
      toggleHeatmap: () =>
        set((state) => {
          const newState = !state.isHeatmapEnabled;
          return {
            isHeatmapEnabled: newState,
            isCrimeModeEnabled: newState ? false : state.isCrimeModeEnabled,
            // Опционально: сбросить выбор при переключении режима
            // selectedRegionId: null,
            // selectedRegionStatus: null,
            // selectedRegionCrimeData: null,
          };
        }),
      toggleCrimeMode: () =>
        set((state) => {
          const newState = !state.isCrimeModeEnabled;
          return {
            isCrimeModeEnabled: newState,
            isHeatmapEnabled: newState ? false : state.isHeatmapEnabled,
            // Опционально: сбросить выбор при переключении режима
            // selectedRegionId: null,
            // selectedRegionStatus: null,
            // selectedRegionCrimeData: null,
          };
        }),
      setHeatmapGroups: (groups) => set({ heatmapGroups: groups }),
      setSelectedRegionId: (id) => set({ selectedRegionId: id }),
      setSelectedRegionStatus: (status) =>
        set({ selectedRegionStatus: status }),
      setSelectedRegionCrimeData: (data) =>
        set({ selectedRegionCrimeData: data }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setViewMode: (mode) => set({ viewMode: mode }),
      resetModesAndSelection: () =>
        set({
          isHeatmapEnabled: false,
          isCrimeModeEnabled: false,
          selectedRegionId: null,
          selectedRegionStatus: null,
          selectedRegionCrimeData: null,
        }),
      // Действие для ручной гидрации, если потребуется
      hydrate: () => {
        // get().hydrate(); // persist делает это автоматически, но действие добавлено для полноты API
        // Можно использовать для дополнительной логики после восстановления
        console.log("MapStore hydrated from localStorage");
      },
    }),
    {
      name: "map-storage", // Имя ключа в localStorage
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) =>
          PERSISTED_KEYS.includes(key as keyof MapState)
        )
      ) as Partial<MapState>,
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
