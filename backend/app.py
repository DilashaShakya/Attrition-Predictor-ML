from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict
import pandas as pd
import joblib
import os
import numpy as np

app = FastAPI()

# Load model files with proper path handling
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "attrition_model.pkl")
feature_cols_path = os.path.join(script_dir, "feature_cols.pkl")
data_path = os.path.join(script_dir, "..", "data", "Attrition.csv")

model = joblib.load(model_path)
feature_cols = joblib.load(feature_cols_path)

# Load training data to understand the data structure
training_data = pd.read_csv(data_path)

# Identify categorical columns that were one-hot encoded
categorical_columns = ['BusinessTravel', 'Department', 'EducationField', 'Gender', 'JobRole', 'MaritalStatus', 'OverTime']

class Employee(BaseModel):
    data: Dict[str, Any]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "ok", "message": "Attrition API is running"}

def preprocess_employee_data(employee_data: Dict[str, Any]) -> pd.DataFrame:
    """Preprocess employee data to match the training data format"""

    # Start with all zeros for the expected feature columns
    processed_data = {col: 0.0 for col in feature_cols}

    # Map raw categorical values to one-hot encoded columns
    for cat_col in categorical_columns:
        if cat_col in employee_data:
            value = employee_data[cat_col]
            # Create the one-hot encoded column name
            encoded_col = f"{cat_col}_{value}"
            if encoded_col in processed_data:
                processed_data[encoded_col] = 1.0

    # Handle numeric columns directly
    numeric_columns = ['Age', 'DailyRate', 'DistanceFromHome', 'Education', 'EmployeeCount',
                      'EmployeeNumber', 'EnvironmentSatisfaction', 'HourlyRate', 'JobInvolvement',
                      'JobLevel', 'JobSatisfaction', 'MonthlyIncome', 'MonthlyRate', 'NumCompaniesWorked',
                      'PercentSalaryHike', 'PerformanceRating', 'RelationshipSatisfaction',
                      'StandardHours', 'StockOptionLevel', 'TotalWorkingYears', 'TrainingTimesLastYear',
                      'WorkLifeBalance', 'YearsAtCompany', 'YearsInCurrentRole', 'YearsSinceLastPromotion',
                      'YearsWithCurrManager']

    for num_col in numeric_columns:
        if num_col in employee_data:
            try:
                processed_data[num_col] = float(employee_data[num_col])
            except (ValueError, TypeError):
                # Use median from training data if conversion fails
                processed_data[num_col] = training_data[num_col].median()

    # Convert to DataFrame and ensure correct column order
    df = pd.DataFrame([processed_data])
    df = df[feature_cols]  # Ensure correct column order

    return df

@app.post("/predict")
def predict(emp: Employee):
    try:
        # Preprocess the input data
        df = preprocess_employee_data(emp.data)

        # Make prediction
        pred = model.predict(df)[0]

        proba = None
        if hasattr(model, "predict_proba"):
            proba = float(model.predict_proba(df)[0, 1])

        if pred in [1, "Yes", "1"]:
            label = "will likely leave (Attrition: Yes)"
            pred_out = "Yes"
        else:
            label = "will likely stay (Attrition: No)"
            pred_out = "No"

        sentence = (
            f"The model predicts this employee {label} with an estimated attrition probability of {proba:.1%}."
            if proba is not None
            else f"The model predicts this employee {label}."
        )

        return {"prediction": pred_out, "probability": proba, "sentence": sentence}

    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}", "prediction": "Error", "probability": None, "sentence": "An error occurred during prediction."}
