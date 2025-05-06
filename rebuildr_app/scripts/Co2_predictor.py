import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'user_db.json')
with open(json_path, 'r', encoding='utf-8') as file:
    data = json.load(file)
user_df = pd.DataFrame(data)


json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'purchase_db.json')
with open(json_path, 'r', encoding='utf-8') as file:
    data = json.load(file)
purchase_df = pd.DataFrame(data)

json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'synonym_db.json')
with open(json_path, 'r', encoding='utf-8') as file:
    data = json.load(file)
synonym_df = pd.DataFrame(data)


csv_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'climate_db.csv') 
climate_df =  pd.read_csv(csv_path)


def calc_volume(height, width, length, unit):
    if unit.upper() == 'CM':
        height, width, length = height/100, width/100, length/100
    elif unit.upper() == 'MM':
         height, width, length = height/1000, width/1000, length/1000
    elif unit.upper() == 'M':
         pass
    else:
        raise ValueError(f"unknown unit {unit}")
    
    return height*width*length


def find_category(description, synonym_df):
    categories = synonym_df.columns 
    best_cat = "" 
    best_sum = 0
    for category in categories:
        synonyms = synonym_df[category]["synonyms"]
        for material in synonym_df[category]["materials"]:
            synonyms = synonyms + [material]
        texts = [description] + synonyms
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        sim_sum = sum(similarities)
        if sim_sum > best_sum: best_cat, best_sum = category, sim_sum
    return best_cat

def find_material(description, synonym_df):
    category = find_category(description,synonym_df)
    best_mat = "" 
    best_sum = 0
    for material in synonym_df[category]["materials"]:
        synonyms = synonym_df[category]["materials"][material]
        texts = [description] + synonyms
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        sim_sum = sum(similarities)
        if sim_sum > best_sum: best_mat, best_sum = material, sim_sum
    texts = [description] + synonyms
    return best_mat

# Function to estimate weight (kg) using volume and density
def estimate_weight(volume, material_name, climate_db):
    density = climate_df.loc[climate_db['Produktnamn'] == material_name, 'Omräkningsfaktor'].iloc[0]
    return volume * density


def train_model(climate_db):
    np.random.seed(42)
    training_data = []
    for _, row in climate_db.iterrows():
        for _ in range(10):
            volume = np.random.uniform(0.001, 5)
            weight = estimate_weight(volume, row['Produktnamn'],climate_db)
            co2 = weight * row['A1-A3 resursens klimatpåverkan, konservativt värde']
            training_data.append({
                'category': row['Kategori'],
                'volume': volume,
                'weight': weight,
                'density': row['Omräkningsfaktor'],
                'co2_factor': row['A1-A3 resursens klimatpåverkan, konservativt värde'],
                'co2_emissions': co2
            })
    train_df = pd.DataFrame(training_data)
    print(train_df[['volume', 'weight', 'density', 'co2_factor']].corr())
    

    
    X = train_df[['category', 'volume']]
    y = train_df['co2_emissions']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    
    # Create a pipeline with one-hot encoding for category
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['category']),
            ('num', StandardScaler(), ['volume'])
        ]
    )
    
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', LinearRegression())
    ])
    
    # Train the model
    model.fit(X_train, y_train)
    # Gör förutsägelser på testdata
    y_pred = model.predict(X_test)
    feature_names = (model.named_steps['preprocessor']
                 .named_transformers_['cat']
                 .get_feature_names_out(['category'])).tolist() + ['volume', 'weight', 'density', 'co2_factor']
    print("Coefficients:", dict(zip(feature_names, model.named_steps['regressor'].coef_)))
# Utvärdera modellen
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Mean Squared Error (MSE): {mse}")
    print(f"R² Score: {r2}")
    return model

def predict_co2_savings(model, category, volume, density):
    # Create input DataFrame for prediction
    input_data = pd.DataFrame({
        'category': [category],
        'volume': [volume],
        'density': [density]
    })
    
    # Predict CO2 savings
    co2_savings = model.predict(input_data)
    
    # Ensure non-negative output
    co2_savings = np.maximum(co2_savings, 0)
    
    return co2_savings[0] 


# Sample purchase data
purchase_data = {
        "purchase_id": 60,
        "seller_id": 7,
        "buyer_id": 3,
        "price": 250,
        "description": "clay roof tiles",
        "height": 2,
        "length": 40,
        "width": 20,
        "Unit": "CM",
        "timestamp": "2025-04-30T15:25:00Z"
    }

co2_factor = climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A1-A3 resursens klimatpåverkan, konservativt värde'].iloc[0]
density = climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'Omräkningsfaktor'].iloc[0]   
cat = climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'Kategori'].iloc[0],    
weight = 0.01 * climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'Omräkningsfaktor'].iloc[0]


features = pd.DataFrame({
    'category': [cat],
    'volume': [0.01]
    })


model = train_model(climate_df)
#co2_pred = model.predict(features)[0]
#print(co2_pred)

print(climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'Enhet för omräkningsfaktor'].iloc[0])    
      
