export interface IRegionData {
  name: string;
  population?: number;
  capital?: string;
  federalDistrict?: string;
  description?: string;
  mainIndustry?: string;
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