# ai-service/models/anomaly.py
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class AnomalyDetector:
    def __init__(self, contamination=0.1):
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.scaler = StandardScaler()
        
    def detect(self, df: pd.DataFrame):
        """
        Détecter les anomalies dans les données
        """
        # Sélectionner les colonnes numériques
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) == 0:
            return np.zeros(len(df))
        
        # Normaliser
        X = df[numeric_cols].fillna(0)
        X_scaled = self.scaler.fit_transform(X)
        
        # Détecter
        self.model.fit(X_scaled)
        predictions = self.model.predict(X_scaled)
        
        # -1 = anomalie, 1 = normal → convertir en 1 (anomalie) et 0 (normal)
        anomalies = (predictions == -1).astype(int)
        
        return anomalies
    
    def detect_ts(self, values: np.ndarray, window: int = 7):
        """
        Détection d'anomalies sur série temporelle (méthode statistique)
        """
        anomalies = np.zeros(len(values))
        
        for i in range(window, len(values) - window):
            window_data = values[i-window:i+window+1]
            mean = np.mean(window_data)
            std = np.std(window_data)
            
            if abs(values[i] - mean) > 2 * std:
                anomalies[i] = 1
                
        return anomalies