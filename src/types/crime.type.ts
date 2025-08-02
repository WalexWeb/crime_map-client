export interface ICrimeData {
  rate: number;
  violentCrimes: number;
  propertyCrimes: number;
  solvedRate: number;
  mostCommonCrime?: string;
  trend?: "рост" | "снижение" | "стабильность";
  lastUpdated?: string;
}
