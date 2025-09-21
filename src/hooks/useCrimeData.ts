import { useState, useEffect } from "react";
import axios from "axios";
import type { ICrimeData } from "@/types/crime.type";

const API_URL = import.meta.env.VITE_API_URL;

export const useCrimeData = () => {
  const [crimeDataMap, setCrimeDataMap] = useState<Record<string, ICrimeData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCrimeData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<ICrimeData[]>(`${API_URL}/crimes/all`);
        const map = response.data.reduce(
          (acc, item) => {
            acc[item.region] = item;
            return acc;
          },
          {} as Record<string, ICrimeData>
        );
        setCrimeDataMap(map);
      } catch (error) {
        setCrimeDataMap({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrimeData();
  }, []);

  return { crimeDataMap, isLoading };
};