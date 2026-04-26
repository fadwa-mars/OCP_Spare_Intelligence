# ai-service/models/forecast.py
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class ConsumptionForecast:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        
    def _create_features(self, df: pd.DataFrame):
        """Créer des features temporelles"""
        df = df.copy()
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['dayofweek'] = df['date'].dt.dayofweek
        df['weekofyear'] = df['date'].dt.isocalendar().week.astype(int)
        df['quarter'] = df['date'].dt.quarter
        
        # Features de lag
        df['lag_1'] = df['quantite'].shift(1)
        df['lag_2'] = df['quantite'].shift(2)
        df['lag_3'] = df['quantite'].shift(3)
        
        # Moyenne mobile
        df['rolling_mean_3'] = df['quantite'].rolling(window=3).mean()
        df['rolling_mean_7'] = df['quantite'].rolling(window=7).mean()
        
        return df.fillna(0)
    
    def predict(self, df: pd.DataFrame, periods: int = 30):
        """
        Prédiction avec Gradient Boosting
        """
        # Préparer les données
        df = self._create_features(df)
        
        # Features
        feature_cols = ['year', 'month', 'day', 'dayofweek', 'weekofyear', 'quarter',
                        'lag_1', 'lag_2', 'lag_3', 'rolling_mean_3', 'rolling_mean_7']
        X = df[feature_cols]
        y = df['quantite']
        
        # Entraîner
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.model.fit(X, y)
        
        # Prédire les périodes futures
        last_date = df['date'].max()
        future_dates = [last_date + pd.Timedelta(days=i) for i in range(1, periods+1)]
        
        # Créer un DataFrame pour les prédictions
        future_df = pd.DataFrame({'date': future_dates})
        future_df['quantite'] = np.nan
        
        # Ajouter des valeurs de lag basées sur la dernière valeur réelle
        last_values = df['quantite'].tail(3).values
        for i in range(periods):
            future_df.loc[i, 'lag_1'] = last_values[-1] if i == 0 else predictions[i-1]
            future_df.loc[i, 'lag_2'] = last_values[-2] if i < 1 else predictions[i-2] if i-2 >= 0 else last_values[-2]
            future_df.loc[i, 'lag_3'] = last_values[-3] if i < 2 else predictions[i-3] if i-3 >= 0 else last_values[-3]
        
        future_df = self._create_features(future_df)
        
        predictions = self.model.predict(future_df[feature_cols])
        predictions = np.maximum(predictions, 0)  # Pas de valeurs négatives
        
        return predictions
    
    def predict_linear(self, df: pd.DataFrame, periods: int = 30):
        """
        Prédiction simple avec régression linéaire
        """
        # Utiliser le temps comme feature
        df = df.sort_values('date')
        X = np.arange(len(df)).reshape(-1, 1)
        y = df['quantite'].values
        
        self.lr_model = LinearRegression()
        self.lr_model.fit(X, y)
        
        # Prédire
        future_X = np.arange(len(df), len(df) + periods).reshape(-1, 1)
        predictions = self.lr_model.predict(future_X)
        predictions = np.maximum(predictions, 0)
        
        return predictions