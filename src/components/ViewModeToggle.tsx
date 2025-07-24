type ViewMode = "map" | "stats";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white border border-gray-200 p-1 rounded-xl inline-flex shadow-sm">
        <button
          onClick={() => setViewMode("map")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            viewMode === "map"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Карта
        </button>
        <button
          onClick={() => setViewMode("stats")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            viewMode === "stats"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Статистика
        </button>
      </div>
    </div>
  );
};
