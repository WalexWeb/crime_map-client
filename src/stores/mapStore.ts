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
  crimeData: Record<string, ICrimeData>;

  // Выбранный регион и его данные
  selectedRegionId: string | null;
  selectedRegionStatus: RegionStatus | null;
  selectedRegionCrimeData: ICrimeData | null;

  // Состояние загрузки
  isLoading: boolean;

  // Режим отображения (карта/статистика)
  viewMode: "map" | "stats";

  // --- Действия ---
  toggleHeatmap: () => void;
  toggleCrimeMode: () => void;
  setHeatmapGroups: (groups: Record<string, number>) => void;
  setCrimeData: (data: Record<string, ICrimeData>) => void;
  setSelectedRegionId: (id: string | null) => void;
  setSelectedRegionStatus: (status: RegionStatus | null) => void;
  setSelectedRegionCrimeData: (data: ICrimeData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setViewMode: (mode: "map" | "stats") => void;
  resetModesAndSelection: () => void;
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
  persist(
    (set) => ({
      // --- Состояния по умолчанию ---
      isHeatmapEnabled: false,
      isCrimeModeEnabled: false,
      heatmapGroups: {},
      crimeData: {},
      selectedRegionId: null,
      selectedRegionStatus: null,
      selectedRegionCrimeData: null,
      isLoading: true,
      viewMode: "map",

      // --- Действия ---
      toggleHeatmap: () =>
        set((state) => ({
          isHeatmapEnabled: !state.isHeatmapEnabled,
          isCrimeModeEnabled: state.isHeatmapEnabled
            ? state.isCrimeModeEnabled
            : false,
        })),

      toggleCrimeMode: () =>
        set((state) => ({
          isCrimeModeEnabled: !state.isCrimeModeEnabled,
          isHeatmapEnabled: state.isCrimeModeEnabled
            ? state.isHeatmapEnabled
            : false,
        })),

      setHeatmapGroups: (groups) => set({ heatmapGroups: groups }),
      setCrimeData: (data) => set({ crimeData: data }),

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

      hydrate: () => {
        console.log("MapStore hydrated from localStorage");
      },
    }),
    {
      name: "map-storage",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) =>
            PERSISTED_KEYS.includes(key as keyof MapState)
          )
        ) as Partial<MapState>,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
