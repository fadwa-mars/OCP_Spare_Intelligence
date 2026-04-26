# ai-service/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
import os

from models.forecast import ConsumptionForecast
from models.anomaly import AnomalyDetector
from models.criticality import CriticalityScore

app = FastAPI(title="OCP AI Service", description="Service IA pour OCP Spare Intelligence")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation des modèles
forecast_model = ConsumptionForecast()
anomaly_detector = AnomalyDetector()
criticality_model = CriticalityScore()

# Modèles de données
class ConsumptionRequest(BaseModel):
    article_id: int
    historique: List[dict]  # [{"date": "2024-01-01", "quantite": 100}, ...]
    periods: int = 30  # jours de prédiction

class AnomalyRequest(BaseModel):
    article_id: int
    data: List[dict]  # [{"date": "2024-01-01", "quantite": 100, "prix": 50}, ...]

class CriticalityRequest(BaseModel):
    article_id: int
    consommation_mensuelle: float
    prix_unitaire: float
    delai_approvisionnement: int
    stock_actuel: float
    seuil_min: float

class PredictionResponse(BaseModel):
    success: bool
    data: Optional[dict]
    message: Optional[str]

# ============================================
# ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {"message": "OCP AI Service", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/predict/consumption", response_model=PredictionResponse)
async def predict_consumption(request: ConsumptionRequest):
    """
    Prédire la consommation future d'un article
    """
    try:
        df = pd.DataFrame(request.historique)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        predictions = forecast_model.predict(df, request.periods)
        
        return PredictionResponse(
            success=True,
            data={
                "article_id": request.article_id,
                "predictions": predictions.tolist(),
                "periods": request.periods,
                "model_used": "prophet"
            }
        )
    except Exception as e:
        return PredictionResponse(
            success=False,
            message=str(e)
        )

@app.post("/detect/anomalies", response_model=PredictionResponse)
async def detect_anomalies(request: AnomalyRequest):
    """
    Détecter des anomalies dans les données de stock/mouvements
    """
    try:
        df = pd.DataFrame(request.data)
        anomalies = anomaly_detector.detect(df)
        
        return PredictionResponse(
            success=True,
            data={
                "article_id": request.article_id,
                "anomalies": anomalies.tolist(),
                "total_points": len(df),
                "anomalies_count": int(anomalies.sum())
            }
        )
    except Exception as e:
        return PredictionResponse(
            success=False,
            message=str(e)
        )

@app.post("/criticality/score", response_model=PredictionResponse)
async def calculate_criticality(request: CriticalityRequest):
    """
    Calculer le score de criticité d'un article
    """
    try:
        features = np.array([[
            request.consommation_mensuelle,
            request.prix_unitaire,
            request.delai_approvisionnement,
            request.stock_actuel,
            request.seuil_min
        ]])
        
        score = criticality_model.predict(features)
        level = criticality_model.get_level(score)
        
        return PredictionResponse(
            success=True,
            data={
                "article_id": request.article_id,
                "score": float(score),
                "level": level,
                "recommendation": criticality_model.get_recommendation(level)
            }
        )
    except Exception as e:
        return PredictionResponse(
            success=False,
            message=str(e)
        )

@app.post("/batch/criticality")
async def batch_criticality(requests: List[CriticalityRequest]):
    """
    Calculer les scores de criticité pour plusieurs articles
    """
    results = []
    for req in requests:
        features = np.array([[
            req.consommation_mensuelle,
            req.prix_unitaire,
            req.delai_approvisionnement,
            req.stock_actuel,
            req.seuil_min
        ]])
        score = criticality_model.predict(features)
        results.append({
            "article_id": req.article_id,
            "score": float(score),
            "level": criticality_model.get_level(score)
        })
    
    return {"success": True, "data": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)