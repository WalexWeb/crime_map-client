export const HEATMAP_COLORS = ["#ef4444", "#10b981", "#f97316", "#9ca3af"];
export const HEATMAP_HOVER_COLORS = [
  "#dc2626",
  "#059669",
  "#ea580c",
  "#6b7280",
];
export const HEATMAP_LABELS = [
  "Введено ВП",
  "Готов к введению (Соответствует требованиям к введению ВП)",
  "Отсутствуют институты государственной власти, обеспечивающие административно-правовой режим при ВП",
  "Нет информации",
];

export const CRIME_LEVEL_LABELS = [
  "Низкая",
  "Средняя",
  "Высокая",
  "Очень высокая",
];

export const CRIME_LEVEL_COLORS = ["#10b981", "#84cc16", "#f59e0b", "#ef4444"];

export const getCrimeLevelColor = (
  crimes: number,
  population: number
): string => {
  if (!population) return "#d1d5db";
  const crimesPer100k = (crimes / population) * 100000;
  const level = getCrimeLevel(crimesPer100k);
  const colorMap = ["#22c55e", "#eab308", "#f97316", "#ef4444"];
  return colorMap[level] || "#d1d5db";
};

const getCrimeLevel = (crimeRate: number): number => {
  if (crimeRate < 5000) return 0;
  if (crimeRate < 7000) return 1;
  if (crimeRate < 10000) return 2;
  return 3;
};
