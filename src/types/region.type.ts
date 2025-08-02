export interface IRegionData {
  name: string;
  population?: number; // Опционально, так как используется ?.toLocaleString()
  capital?: string;
  area?: number; // Используется в последних версиях RegionInfoPanel
  federalDistrict?: string;
  description?: string;
  mainIndustry?: string; // Может присутствовать, хотя не используется в последнем RegionInfoPanel
}

export interface IRegionMockData {
  [key: string]: {
    population: number;
    capital: string;
    federalDistrict: string;
    description: string;
    mainIndustry: string;
  };
}
