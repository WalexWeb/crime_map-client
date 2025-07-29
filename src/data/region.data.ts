import type { ICrimeData } from "@/types/crime.type";
import type { IRegionData } from "@/types/region.type";


// Основные данные регионов
export const REGION_MOCK_DATA: Record<string, Omit<IRegionData, 'id'>> = {
  region1: {
    name: "Центральный регион",
    capital: "Москва",
    population: 25000000,
    area: 650000,
    federalDistrict: "Центральный",
    mainIndustry: "Финансы, IT",
    description: "Наиболее развитый экономический регион"
  },
  region2: {
    name: "Северо-Западный регион",
    capital: "Санкт-Петербург",
    population: 8000000,
    area: 1700000,
    federalDistrict: "Северо-Западный",
    mainIndustry: "Судостроение, туризм"
  },
  // ... другие регионы
};

// Данные о преступности
export const CRIME_DATA_MOCK: Record<string, ICrimeData> = {
  region1: {
    rate: 450,
    violentCrimes: 120,
    propertyCrimes: 330,
    solvedRate: 65,
    mostCommonCrime: "Кражи",
    trend: "рост",
    lastUpdated: "2023-11-01"
  },
  region2: {
    rate: 320,
    violentCrimes: 80,
    propertyCrimes: 240,
    solvedRate: 75,
    mostCommonCrime: "Мошенничество",
    trend: "снижение",
    lastUpdated: "2023-10-15"
  },
  // ... другие регионы
};