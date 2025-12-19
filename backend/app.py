from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict
import pandas as pd
import joblib

app = FastAPI()

model = joblib.load("attrition_model.pkl")
feature_cols = joblib.load("feature_cols.pkl")

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

@app.post("/predict")
def predict(emp: Employee):
    row = {col: None for col in feature_cols}
    row.update(emp.data)
    df = pd.DataFrame([row], columns=feature_cols)

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
