import { useMemo } from "react";

export const useCrimeLevel = (crimes: number, population: number) => {
  return useMemo(() => {
    if (!population) return 0;
    const rate = (crimes / population) * 100000;
    if (rate < 5000) return 0;
    if (rate < 7000) return 1;
    if (rate < 10000) return 2;
    return 3;
  }, [crimes, population]);
};
