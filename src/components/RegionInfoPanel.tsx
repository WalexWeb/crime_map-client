import React from "react";
import { motion } from "framer-motion";
import type { IRegionData } from "@/types/region.type";

interface RegionInfoPanelProps {
  region: IRegionData;
  onReset: () => void;
}

export const RegionInfoPanel: React.FC<RegionInfoPanelProps> = ({
  region,
  onReset,
}) => (
  <motion.div
    key="region-info"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl p-6 shadow-md border border-gray-200 h-full flex flex-col"
  >
    <h2 className="text-2xl font-bold mb-4 text-gray-800">{region.name}</h2>
    <div className="space-y-3 text-gray-600 flex-grow">
      <p>
        <span className="text-gray-500 font-medium">Столица:</span>{" "}
        {region.capital}
      </p>
      <p>
        <span className="text-gray-500 font-medium">Федеральный округ:</span>{" "}
        {region.federalDistrict}
      </p>
      <p>
        <span className="text-gray-500 font-medium">Население:</span>{" "}
        {region.population?.toLocaleString()} чел.
      </p>
      <p>
        <span className="text-gray-500 font-medium">Основная отрасль:</span>{" "}
        {region.mainIndustry}
      </p>
      <p className="mt-4">
        <span className="text-gray-500 font-medium">Описание:</span>{" "}
        {region.description}
      </p>
    </div>
    <button
      onClick={onReset}
      className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition shadow-sm"
    >
      Сбросить выбор
    </button>
  </motion.div>
);
