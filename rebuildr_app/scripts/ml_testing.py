import os
import joblib
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Set random seed for reproducibility
np.random.seed(42)

csv_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'climate_db.csv') 
climate_df =  pd.read_csv(csv_path)
climate_df.columns = ['Produktnamn', 'Kategori',
       'A1-A3',
       'A4',
       'A5',
       'Enhet för klimatpåverkan', 
       'Omräkningsfaktor',
       'Enhet för omräkningsfaktor']

# Load your data (replace with your dataset)
training_data = []
for _, row in climate_df.iterrows():
    for _ in range(100):
        volume = np.random.uniform(0.001, 5)
        weight = volume*row['Omräkningsfaktor']
        co2_factor = row['A1-A3']+row['A4']+row['A5']
        co2 = weight * co2_factor
        training_data.append({
            'volume':volume,
            'Kategori':row['Kategori'],
            'A1-A3': row['A1-A3'],
            'A4': row['A4'],
            'A5': row['A5'],
            'Omräkningsfaktor':row['Omräkningsfaktor'],
            'CO2_savings': co2
        })
train_df = pd.DataFrame(training_data)
train_df['CO2_savings_log'] = np.log1p(train_df['CO2_savings'])
print(train_df)
# Define features and target
features = ['Kategori','volume','A1-A3', 'A4', 'A5', 'Omräkningsfaktor']
target = 'CO2_savings_log'  # Replace with your target column


# Split data
X = train_df[features]
y = train_df[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Preprocessing pipeline
numeric_features = ['volume', 'A1-A3', 'A4', 'A5', 'Omräkningsfaktor']
categorical_features = ['Kategori']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first'), categorical_features)
    ])

# Model pipeline
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression()) #LinearRegression() # RandomForestRegressor(n_estimators=100, random_state=42)
])

# Train model
model.fit(X_train, y_train)

# Export the model to a file
#model_path = os.path.join(os.path.dirname(__file__), '..', 'scripts/models', 'co2_savings_model.joblib')
#os.makedirs(os.path.dirname(model_path), exist_ok=True)  # Create models directory if it doesn't exist
#joblib.dump(model, model_path)
#print(f"Model saved to {model_path}")





"""
weight = 0.01 * climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'Omräkningsfaktor'].iloc[0]
co2_factor1= climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A1-A3'].iloc[0]
co2_factor2= climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A4'].iloc[0]
co2_factor3= climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A5'].iloc[0]
print(weight*(co2_factor1+co2_factor2+co2_factor3))

features = pd.DataFrame({
    'weight':[weight], 
    'co2_factor1':[co2_factor1], 
    'co2_factor2':[co2_factor2], 
    'co2_factor3':[co2_factor3]
    })
"""
