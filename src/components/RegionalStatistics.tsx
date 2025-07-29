import React from "react";
import { motion } from "framer-motion";
import { REGION_MOCK_DATA } from "@/data/region.data";

export const RegionalStatistics: React.FC = () => {
  const regions = Object.entries(REGION_MOCK_DATA);
  const total = regions.reduce((sum, [, region]) => sum + region.population, 0);
  return (
    <motion.div
      key="region-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-200 h-full"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Статистика по регионам
      </h2>
      <div className="space-y-4">
        {regions
          .sort((a, b) => b[1].population - a[1].population)
          .map(([key, region]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-700 font-medium">{key}</span>
                <span className="text-gray-600">
                  {region.population.toLocaleString()} чел.
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(region.population / 1500000) * 100}%` }}
                  className="h-2 bg-blue-500 rounded-full"
                />
              </div>
            </div>
          ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100">
        <span className="text-gray-500">Общее население:</span>{" "}
        <span className="font-bold text-gray-800 text-lg ml-2">
          {total.toLocaleString()} чел.
        </span>
      </div>
    </motion.div>
  );
};
