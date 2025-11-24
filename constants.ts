import { CityData, ModelMetric, ModelType } from './types';

export const CITIES: CityData[] = [
  { name: "Delhi", state: "Delhi", defaultValues: { pm25: 180, pm10: 250, no2: 45, co: 1.2, so2: 12, o3: 30 } },
  { name: "Mumbai", state: "Maharashtra", defaultValues: { pm25: 65, pm10: 120, no2: 25, co: 0.8, so2: 8, o3: 25 } },
  { name: "Bengaluru", state: "Karnataka", defaultValues: { pm25: 45, pm10: 90, no2: 20, co: 0.6, so2: 6, o3: 20 } },
  { name: "Kolkata", state: "West Bengal", defaultValues: { pm25: 140, pm10: 200, no2: 35, co: 1.1, so2: 10, o3: 28 } },
  { name: "Chennai", state: "Tamil Nadu", defaultValues: { pm25: 50, pm10: 95, no2: 18, co: 0.7, so2: 9, o3: 22 } },
  { name: "Hyderabad", state: "Telangana", defaultValues: { pm25: 55, pm10: 105, no2: 22, co: 0.65, so2: 7, o3: 24 } },
  { name: "Ahmedabad", state: "Gujarat", defaultValues: { pm25: 80, pm10: 140, no2: 30, co: 0.9, so2: 15, o3: 35 } },
  { name: "Pune", state: "Maharashtra", defaultValues: { pm25: 60, pm10: 110, no2: 28, co: 0.75, so2: 5, o3: 26 } },
];

export const MODEL_METRICS: ModelMetric[] = [
  { name: "Linear Regression", r2: "0.62", rmse: "High", mae: "High" },
  { name: "Random Forest", r2: "0.85", rmse: "Low", mae: "Low" },
  { name: "Gradient Boosting", r2: "0.88", rmse: "Lowest", mae: "Lowest" },
  { name: "ARIMA", r2: "—", rmse: "—", mae: "—" },
];

export const PYTHON_CODE_DATASET = `from kaggle.api.kaggle_api_extended import KaggleApi

# Initialize Kaggle API
api = KaggleApi()
api.authenticate()

# Download Kaggle Dataset (India specific)
api.dataset_download_files(
    'bappekim/air-pollution-in-india',
    path='data/kaggle_raw',
    unzip=True
)

# Download WHO Dataset
import requests
url = "https://cdn.who.int/media/docs/default-source/air-pollution-database/who_aqi_data.csv"
response = requests.get(url)
with open("data/who_aqi.csv", "wb") as f:
    f.write(response.content)

# Combine the two datasets
import pandas as pd
df_k = pd.read_csv("data/kaggle_raw/air_quality.csv")
df_w = pd.read_csv("data/who_aqi.csv")

# Merging logic (simplified)
df = pd.concat([df_k, df_w], ignore_index=True)`;

export const PYTHON_CODE_PREPROCESSING = `# Handling Missing Values
df.fillna(method='ffill', inplace=True)
df.fillna(df.mean(), inplace=True)

# Outlier Filtering (IQR Method)
Q1 = df.quantile(0.25)
Q3 = df.quantile(0.75)
IQR = Q3 - Q1
df = df[~((df < (Q1 - 1.5 * IQR)) | (df > (Q3 + 1.5 * IQR))).any(axis=1)]

# Date Parsing
df['Date'] = pd.to_datetime(df['Date'])
df.set_index('Date', inplace=True)

# Normalization (Min-Max Scaling)
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
df_scaled = pd.DataFrame(scaler.fit_transform(df), columns=df.columns)`;

export const PYTHON_CODE_TRAINING = `from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from statsmodels.tsa.arima.model import ARIMA
import joblib

# Split Data
X = df.drop('AQI', axis=1)
y = df['AQI']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 1. Linear Regression
model_lr = LinearRegression()
model_lr.fit(X_train, y_train)

# 2. Random Forest Regressor
model_rf = RandomForestRegressor(n_estimators=100, random_state=42)
model_rf.fit(X_train, y_train)

# 3. Gradient Boosting Regressor
model_gb = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1)
model_gb.fit(X_train, y_train)

# 4. ARIMA (Time Series) - Trained on full history
model_arima = ARIMA(y, order=(5,1,0))
model_arima_fit = model_arima.fit()

# Save Model Artifacts
joblib.dump(model_lr, "model_linear.pkl")
joblib.dump(model_rf, "model_rf.pkl")
joblib.dump(model_gb, "model_gb.pkl")
joblib.dump(model_arima, "model_arima.pkl")`;

export const PYTHON_CODE_EVALUATION = `from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import numpy as np

def evaluate_model(model, X_test, y_test, name):
    preds = model.predict(X_test)
    r2 = r2_score(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    mae = mean_absolute_error(y_test, preds)
    return {"Model": name, "R2": r2, "RMSE": rmse, "MAE": mae}

results = []
results.append(evaluate_model(model_lr, X_test, y_test, "Linear Regression"))
results.append(evaluate_model(model_rf, X_test, y_test, "Random Forest"))
results.append(evaluate_model(model_gb, X_test, y_test, "Gradient Boosting"))

# Display results table
print(pd.DataFrame(results))`;
