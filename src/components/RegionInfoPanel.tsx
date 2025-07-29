import { motion } from "framer-motion";
import type { ICrimeData } from "@/types/crime.type";
import type { IRegionData } from "@/types/region.type";

interface Props {
  region: IRegionData;
  crimeData: ICrimeData | null;
  onReset: () => void;
}

export const RegionInfoPanel = ({ region, crimeData, onReset }: Props) => {
  const getCrimeLevel = (rate: number) => {
    if (rate < 300) return "Низкий";
    if (rate < 450) return "Средний";
    if (rate < 600) return "Высокий";
    return "Очень высокий";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl shadow-lg p-6 h-full"
    >
      <h2 className="text-2xl font-bold mb-4">{region.name}</h2>

      <div className="space-y-3">
        <p>
          <span className="font-semibold">Столица:</span> {region.capital}
        </p>
        <p>
          <span className="font-semibold">Население:</span>{" "}
          {region.population.toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Площадь:</span>{" "}
          {region.area.toLocaleString()} км²
        </p>

        {crimeData && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Криминальная статистика</h3>
            <p>
              <span className="font-semibold">Уровень:</span>{" "}
              {getCrimeLevel(crimeData.rate)}
            </p>
            <p>
              <span className="font-semibold">Преступлений/100k:</span>{" "}
              {crimeData.rate}
            </p>
            <p>
              <span className="font-semibold">Частый тип:</span>{" "}
              {crimeData.mostCommonCrime}
            </p>
            <p>
              <span className="font-semibold">Тенденция:</span>{" "}
              {crimeData.trend}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Сбросить выбор
      </button>
    </motion.div>
  );
};
