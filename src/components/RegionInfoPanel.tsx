import { motion } from "framer-motion";
import type { IRegionData } from "@/types/region.type";
import { useMapStore } from "@/stores/mapStore";
import React from "react";

interface Props {
  region: IRegionData;
  onReset: () => void;
}

export const RegionInfoPanel = React.memo(({ region, onReset }: Props) => {
  const {
    isHeatmapEnabled,
    isCrimeModeEnabled,
    selectedRegionStatus,
    selectedRegionCrimeData,
  } = useMapStore();

  const getCrimeLevelLabel = (rate: number) => {
    if (rate < 5000) return "Низкая";
    if (rate < 7000) return "Средняя";
    if (rate < 10000) return "Высокая";
    return "Очень высокая";
  };

  const crimeRate =
    selectedRegionCrimeData && region.population
      ? Math.round((selectedRegionCrimeData.total / region.population) * 100000)
      : null;

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
          <span className="font-semibold">Административный центр:</span>{" "}
          {region.capital}
        </p>
        <p>
          <span className="font-semibold">Население:</span>{" "}
          {region.population?.toLocaleString() || "Н/Д"}
        </p>
        <p>
          <span className="font-semibold">Федеральный округ:</span>{" "}
          {region.federalDistrict || "Н/Д"}
        </p>
        <p>
          <span className="font-semibold">Описание:</span>{" "}
          {region.description || "Нет описания"}
        </p>

        {isHeatmapEnabled && selectedRegionStatus !== null && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Статус готовности</h3>
            <p>
              Статус:{" "}
              {[
                "Введено ВП",
                "Готов к введению",
                "Отсутствуют институты",
                "Нет информации",
              ][Number(selectedRegionStatus)] || "Неизвестно"}
            </p>
          </div>
        )}

        {isCrimeModeEnabled && selectedRegionCrimeData && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Криминальная статистика</h3>
            {crimeRate !== null && (
              <p>
                <span className="font-semibold">Уровень преступности:</span>{" "}
                {getCrimeLevelLabel(crimeRate)} ({crimeRate} на 100к)
              </p>
            )}
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">Всего преступлений:</span>{" "}
                {selectedRegionCrimeData.total.toLocaleString()}
              </li>
              <li>
                <span className="font-semibold">Особо тяжкие:</span>{" "}
                {selectedRegionCrimeData.osob.toLocaleString()}
              </li>
              <li>
                <span className="font-semibold">Экстремизм:</span>{" "}
                {selectedRegionCrimeData.extremism.toLocaleString()}
              </li>
              <li>
                <span className="font-semibold">Терроризм:</span>{" "}
                {selectedRegionCrimeData.terrorism.toLocaleString()}
              </li>
              <li>
                <span className="font-semibold">Оружие:</span>{" "}
                {selectedRegionCrimeData.weapon.toLocaleString()}
              </li>
            </ul>
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
});
