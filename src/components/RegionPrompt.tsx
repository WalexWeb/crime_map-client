import { motion } from "framer-motion";

export const RegionPrompt = () => (
  <motion.div
    key="region-prompt"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-white rounded-xl p-6 text-center text-gray-500 flex flex-col justify-center items-center h-full border border-gray-200 shadow-sm"
  >
    <svg
      className="w-10 h-10 mb-4 text-gray-400 animate-bounce"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
    <p className="text-gray-600">
      Выберите регион на карте для отображения информации
    </p>
  </motion.div>
);
