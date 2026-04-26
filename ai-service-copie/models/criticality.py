# ai-service/models/criticality.py
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

class CriticalityScore:
    def __init__(self):
        self.rf_model = self._create_model()
        
    def _create_model(self):
        """
        Créer un modèle Random Forest pour le scoring
        """
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # Données d'entraînement simulées (à remplacer par données réelles)
        X_train = np.array([
            # [conso_mensuelle, prix_unitaire, delai_appro, stock_actuel, seuil_min]
            [1000, 500, 30, 500, 200],  # Score élevé
            [500, 200, 15, 300, 100],   # Score moyen
            [100, 50, 7, 150, 50],      # Score faible
            [2000, 1000, 45, 800, 300], # Très élevé
            [50, 20, 5, 50, 20],        # Très faible
            [800, 300, 25, 400, 150],   # Élevé
            [300, 100, 10, 200, 80],    # Moyen
            [30, 10, 3, 30, 10],        # Très faible
        ])
        
        y_train = np.array([85, 65, 40, 95, 25, 78, 55, 20])
        
        model.fit(X_train, y_train)
        return model
    
    def predict(self, features: np.ndarray):
        """
        Prédire le score de criticité (0-100)
        """
        score = self.rf_model.predict(features)[0]
        return np.clip(score, 0, 100)
    
    def get_level(self, score: float):
        """
        Déterminer le niveau de criticité
        """
        if score >= 80:
            return "CRITIQUE"
        elif score >= 60:
            return "ÉLEVÉ"
        elif score >= 40:
            return "MOYEN"
        elif score >= 20:
            return "FAIBLE"
        else:
            return "NÉGLIGEABLE"
    
    def get_recommendation(self, level: str):
        """
        Obtenir une recommandation selon le niveau
        """
        recommendations = {
            "CRITIQUE": "Action immédiate requise. Stock de sécurité à augmenter, commande urgente.",
            "ÉLEVÉ": "Surveillance renforcée. Prévoir réapprovisionnement proactif.",
            "MOYEN": "Gestion standard. Suivi régulier recommandé.",
            "FAIBLE": "Gestion simplifiée. Peut être groupé avec d'autres articles.",
            "NÉGLIGEABLE": "Stock minimal. Commandes ponctuelles."
        }
        return recommendations.get(level, "Gestion standard.")