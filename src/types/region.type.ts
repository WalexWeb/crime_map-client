export interface IRegionData {
  id: string;
  name: string;
  capital: string;
  population: number;
  area: number;
  federalDistrict: string;
  mainIndustry?: string;
  description?: string;
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