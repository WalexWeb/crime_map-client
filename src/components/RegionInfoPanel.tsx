import { motion } from "framer-motion";
import type { IRegionData } from "@/types/region.type";
import { useMapStore } from "@/stores/mapStore"; // 1. Импортируем хранилище

interface Props {
  region: IRegionData;
  // 3. Убираем crimeData из пропсов
  onReset: () => void;
}

export const RegionInfoPanel = ({ region, onReset }: Props) => {
  // 4. Получаем данные из хранилища
  const {
    isHeatmapEnabled,
    isCrimeModeEnabled,
    selectedRegionStatus,
    selectedRegionCrimeData, // Данные преступности из хранилища
  } = useMapStore();

  // Функция для определения уровня преступности (можно перенести в утилиты)
  const getCrimeLevelLabel = (rate: number) => {
    if (rate < 300) return "Низкая";
    if (rate < 450) return "Средняя";
    if (rate < 600) return "Высокая";
    return "Очень высокая";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col"
    >
      <h2 className="text-2xl font-bold mb-4">{region.name}</h2>

      <div className="space-y-3 flex-grow">
        <p>
          <span className="font-semibold">Столица:</span> {region.capital}
        </p>
        <p>
          <span className="font-semibold">Население:</span>{" "}
          {region.population?.toLocaleString() || "Н/Д"}
        </p>
        <p>
          <span className="font-semibold">Площадь:</span>{" "}
          {region.area ? `${region.area.toLocaleString()} км²` : "Н/Д"}
        </p>
        <p>
          <span className="font-semibold">Федеральный округ:</span>{" "}
          {region.federalDistrict || "Н/Д"}
        </p>
        <p>
          <span className="font-semibold">Описание:</span>{" "}
          {region.description || "Нет описания"}
        </p>

        {/* Отображение данных в зависимости от активного режима */}
        {/* 5. Отображаем статус, если активен режим тепловой карты */}
        {isHeatmapEnabled && selectedRegionStatus !== null && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Статус готовности</h3>
            <p>
              {/* Предполагается, что selectedRegionStatus это число от 0 до 3 */}
              Статус:{" "}
              STATUS_LABELS[selectedRegionStatus] || "Неизвестно"
              {/* Если selectedRegionStatus это строковый enum, используйте STATUS_LABELS[selectedRegionStatus] */}
              {/* Пример для числового статуса: */}
              {[
                "Введено ВП",
                "Готов к введению",
                "Отсутствуют институты",
                "Нет информации",
              ]}
            </p>
          </div>
        )}

        {/* 6. Отображаем криминальную статистику, если активен режим криминогенной обстановки */}
        {isCrimeModeEnabled && selectedRegionCrimeData && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Криминальная статистика</h3>
            <p>
              <span className="font-semibold">Уровень:</span>{" "}
              {getCrimeLevelLabel(selectedRegionCrimeData.rate)}
            </p>
            <p>
              <span className="font-semibold">Преступлений/100k:</span>{" "}
              {selectedRegionCrimeData.rate}
            </p>
            <p>
              <span className="font-semibold">Насильственные:</span>{" "}
              {selectedRegionCrimeData.violentCrimes}
            </p>
            <p>
              <span className="font-semibold">Против собственности:</span>{" "}
              {selectedRegionCrimeData.propertyCrimes}
            </p>
            <p>
              <span className="font-semibold">Раскрыто:</span>{" "}
              {selectedRegionCrimeData.solvedRate}%
            </p>
            <p>
              <span className="font-semibold">Частый тип:</span>{" "}
              {selectedRegionCrimeData.mostCommonCrime || "Н/Д"}
            </p>
            <p>
              <span className="font-semibold">Тенденция:</span>{" "}
              {selectedRegionCrimeData.trend || "Н/Д"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Последнее обновление:{" "}
              {selectedRegionCrimeData.lastUpdated || "Н/Д"}
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
