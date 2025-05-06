import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
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

def predict_co2_savings(material_name, volume, climate_db, model):
    """
    Predict CO2 savings (kg CO₂e) for a given material and weight.
    
    Parameters:
    - material_name (str): Name of the material (Produktnamn).
    - weight_kg (float): Weight of the material in kg.
    - climate_df (pd.DataFrame): DataFrame with material data.
    - model: Trained model pipeline.
    - features (list): List of feature names used by the model.
    
    Returns:
    - float: Predicted CO2 savings in kg CO₂e.
    """
    features = pd.DataFrame({
    'volume':volume,
    'Kategori':[climate_df.loc[climate_df['Produktnamn'] == material_name, 'Kategori'].iloc[0]],
    'A1-A3':[climate_df.loc[climate_df['Produktnamn'] == material_name, 'A1-A3'].iloc[0]],
    'A4':[climate_df.loc[climate_df['Produktnamn'] == material_name, 'A4'].iloc[0]],
    'A5':[climate_df.loc[climate_df['Produktnamn'] == material_name, 'A5'].iloc[0]],
    'Omräkningsfaktor':[climate_df.loc[climate_df['Produktnamn'] == material_name, 'Omräkningsfaktor'].iloc[0]]
    })

    # Find material in climate_df
    material_row = climate_db[climate_db['Produktnamn'] == material_name]
    if material_row.empty:
        raise ValueError(f"Material '{material_name}' not found in climate_df")
    
    # Extract features for the material

    
    # Predict log-transformed CO2 savings
    co2_savings_log_pred = model.predict(features)[0]
    
    # Reverse log transformation
    co2_savings_pred = np.expm1(co2_savings_log_pred)
    weight_kg = volume * material_row['Omräkningsfaktor'].iloc[0]
    # Scale by weight (assuming CO2_savings_log was trained on total CO2 savings)
    total_co2_savings = co2_savings_pred * weight_kg / material_row['Omräkningsfaktor'].iloc[0]
    
    return total_co2_savings


# Predict and evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f'MSE: {mse:.2f}, R²: {r2:.2f}')

co2 = predict_co2_savings('Spånskiva',1,climate_df,model)
print(co2)
weight = 1 * climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'Omräkningsfaktor'].iloc[0]
co2_factor1= climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A1-A3'].iloc[0]
co2_factor2= climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A4'].iloc[0]
co2_factor3= climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A5'].iloc[0]
print(weight*(co2_factor1+co2_factor2+co2_factor3))


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
