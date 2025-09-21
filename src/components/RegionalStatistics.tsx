import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { REGION_MOCK_DATA } from "@/data/region.data";
import type { ICrimeData } from "@/types/crime.type";
import type { IRegionData } from "@/types/region.type";

const API_URL = import.meta.env.VITE_API_URL;

const getCrimeLevel = (crimeRate: number): number => {
  if (crimeRate < 5000) return 0;
  if (crimeRate < 7000) return 1;
  if (crimeRate < 10000) return 2;
  return 3;
};

const getProgressWidth = (crimes: number, population: number) => {
  if (!population) return 0;
  const crimesPer100k = (crimes / population) * 100000;
  return Math.min((crimesPer100k / 10000) * 100, 100);
};

const getCrimeLevelColor = (crimes: number, population: number) => {
  if (!population) return "bg-gray-300";
  const crimesPer100k = (crimes / population) * 100000;
  const level = getCrimeLevel(crimesPer100k);
  const colorMap = [
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
  ];
  return colorMap[level] || "bg-gray-300";
};

export const RegionalStatistics: React.FC = () => {
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [crimeDataMap, setCrimeDataMap] = useState<Record<string, ICrimeData>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCrimeData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<ICrimeData[]>(`${API_URL}/crimes/all`);
        const data = response.data;

        const map = data.reduce(
          (acc, item) => {
            acc[item.region] = item;
            return acc;
          },
          {} as Record<string, ICrimeData>
        );

        setCrimeDataMap(map);
      } catch (error) {
        console.error("❌ Failed to load crime data:", error);
        setCrimeDataMap({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrimeData();
  }, []);

  const toggleDistrict = (district: string) => {
    setExpandedDistrict(expandedDistrict === district ? null : district);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Берём только округа (ключи, у которых нет federalDistrict)
  const districts = Object.entries(REGION_MOCK_DATA).filter(
    ([_, data]) => !("federalDistrict" in data)
  );

  return (
    <motion.div
      key="district-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-200 h-full max-h-screen overflow-y-auto"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Статистика по федеральным округам
      </h2>

      <div className="space-y-4">
        {districts.map(([districtKey, districtData]) => {
          const population = districtData.population || 1;

          // Считаем суммарные преступления по всем регионам округа
          const crimes = Object.entries(REGION_MOCK_DATA)
            .filter(
              ([_, r]) => (r as IRegionData).federalDistrict === districtKey
            )
            .reduce((sum, [regionKey]) => {
              return sum + (crimeDataMap[regionKey]?.total || 0);
            }, 0);

          const crimesPer100k = (crimes / population) * 100000;
          const progressWidth = getProgressWidth(crimes, population);
          const colorClass = getCrimeLevelColor(crimes, population);

          return (
            <div
              key={districtKey}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleDistrict(districtKey)}
                className="w-full text-left focus:outline-none"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-800 font-semibold">
                    {districtData.name}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {population.toLocaleString()} чел.
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span>Преступлений: {crimes.toLocaleString()}</span>
                  <span>
                    {isNaN(crimesPer100k) ? "Н/Д" : crimesPer100k.toFixed(1)} на
                    100к чел.
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressWidth}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-3 ${colorClass} rounded-full`}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Низкий уровень</span>
                  <span>Высокий уровень</span>
                </div>
              </button>

              {/* Раскрывающиеся регионы */}
              <AnimatePresence>
                {expandedDistrict === districtKey && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                  >
                    {Object.entries(REGION_MOCK_DATA)
                      .filter(
                        ([_, r]) =>
                          (r as IRegionData).federalDistrict === districtKey
                      )
                      .map(([regionKey, region]) => {
                        const crimes = crimeDataMap[regionKey]?.total || 0;
                        const population = region.population || 1;
                        const crimesPer100k =
                          (crimes / population) * 100000 || 0;
                        const progressWidth = getProgressWidth(
                          crimes,
                          population
                        );
                        const colorClass = getCrimeLevelColor(
                          crimes,
                          population
                        );

                        return (
                          <div
                            key={regionKey}
                            className="border border-gray-100 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-700 font-medium">
                                {regionKey}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {population.toLocaleString()} чел.
                              </span>
                            </div>

                            <div className="flex justify-between text-sm mb-1">
                              <span>
                                Преступлений: {crimes.toLocaleString()}
                              </span>
                              <span>
                                {isNaN(crimesPer100k)
                                  ? "Н/Д"
                                  : crimesPer100k.toFixed(1)}{" "}
                                на 100к чел.
                              </span>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressWidth}%` }}
                                transition={{ duration: 0.5 }}
                                className={`h-2 ${colorClass} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
