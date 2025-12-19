from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()
model = joblib.load("attrition_model.pkl")
feature_cols = joblib.load("feature_cols.pkl")

class Employee(BaseModel):
    data: dict

@app.get("/")
def home():
    return {"message": "Attrition Prediction API is running"}


@app.post("/predict")
def predict(emp:Employee):
    row = {col: None for col in feature_cols}
    row.update(emp.data)
    df = pd.DataFrame([row], columns=feature_cols)

    pred = model.predict(df)[0]
    proba = float(model.predict_proba(df)[0,1])

    if pred in [1, "Yes"]:
        label = "will likely leave (Attrition: Yes)"
    else:
        label = "will likely stay (Attrition: No)"

    sentence = f"The model predicts this employee {label} with an estimated attrition probability of {proba:.1%}."

    return {
        "prediction": str(pred),
        "probability": proba,
        "sentence": sentence
    }
