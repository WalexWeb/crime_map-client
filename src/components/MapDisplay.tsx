import React, { type RefObject } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";

interface MapDisplayProps {
  mapObjectRef: RefObject<HTMLObjectElement>;
  isLoading: boolean;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({
  mapObjectRef,
  isLoading,
}) => {
  return (
    <div className="lg:w-3/4 relative bg-white rounded-xl shadow-md border border-gray-200 p-4">
      {isLoading && (
        <motion.div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <object
          ref={mapObjectRef}
          id="map"
          data="/map.svg"
          type="image/svg+xml"
          className="w-full h-full min-h-[500px] rounded-lg"
          aria-label="Карта регионов"
        />
      </motion.div>
      <Tooltip id="region-tooltip" place="top" />
    </div>
  );
};
