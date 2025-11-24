export interface CityData {
  name: string;
  state: string;
  defaultValues: {
    pm25: number;
    pm10: number;
    no2: number;
    co: number;
    so2: number;
    o3: number;
  };
}

export interface PredictionResponse {
  predictedAQI: number;
  category: "Good" | "Moderate" | "Poor" | "Very Poor" | "Severe";
  contributors: string[];
  notes: string;
  confidenceScore?: number;
}

export enum ModelType {
  LINEAR_REGRESSION = "Linear Regression",
  RANDOM_FOREST = "Random Forest",
  GRADIENT_BOOSTING = "Gradient Boosting",
  ARIMA = "ARIMA (Time Series)",
}

export interface ModelMetric {
  name: string;
  r2: string;
  rmse: string;
  mae: string;
}