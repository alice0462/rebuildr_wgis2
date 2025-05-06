import json
import pandas as pd
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
#from deep_translator import GoogleTranslator
from sklearn.preprocessing import LabelEncoder

json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'user_db.json')
with open(json_path, 'r') as file:
    data = json.load(file)
user_df = pd.DataFrame(data)


json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'purchase_db.json')
with open(json_path, 'r') as file:
    data = json.load(file)
purchase_df = pd.DataFrame(data)

json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'synonym_db.json')
with open(json_path, 'r') as file:
    data = json.load(file)
synonym_db = data


csv_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'climate_db_en.csv') 
climate_df =  pd.read_csv(csv_path)

climate_df['Total_CO2e_per_kg'] = (
    climate_df['A1-A3 resursens klimatpåverkan, konservativt värde'] +
    climate_df['A4 transporters klimatpåverkan GWP-GHG'] +
    climate_df['A5 byggspills klimatpåverkan GWP-GHG, konservativt värde']
)

# Define conversion factors to meters
unit_conversions = {
    'M': 1.0,          # Meters (no conversion needed)
    'CM': 0.01,        # Centimeters to meters (1 cm = 0.01 m)
    'MM': 0.001        # Millimeters to meters (1 mm = 0.001 m)
}

# Calculate volume in cubic meters, accounting for units
purchase_df['Volume_m3'] = (
    purchase_df['height'] * 
    purchase_df['length'] * 
    purchase_df['width'] * 
    purchase_df['Unit'].map(unit_conversions) ** 3
) / 1_000_000


def match_description(description, product_names):
# Combine description and product names for TF-IDF
    texts = [description] + product_names.tolist()
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts)
    
    # Compute cosine similarity between description and all product names
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
    
    # Find the index of the highest similarity score
    best_match_idx = np.argmax(similarities)
    best_score = similarities[best_match_idx]
    
    # Return the matched product name if similarity is above a threshold
    if best_score > 0.001:  # Adjust threshold as needed
        return product_names.iloc[best_match_idx]
    return None  # Fallback if no good match

purchase_df['Matched_Produktnamn'] = purchase_df['description'].apply(
    lambda x: match_description(x, climate_df['Produktnamn'])
)

print(purchase_df)

import re
# Cleaning function for user inputs
def clean_material_name(name):
    if not isinstance(name, str):
        return ""
    name = name.lower().strip()
    name = re.sub(r'[^\w\s]', '', name)  # Remove punctuation
    name = re.sub(r'\s+', ' ', name)  # Normalize spaces
    return name

# Mapping function
def map_material(user_input, synonym_db):
    cleaned_input = clean_material_name(user_input)
    if not cleaned_input:
        return None, None  # Return None for category and material if input is invalid
    
    # First, try to match material synonyms or names
    for category, cat_data in synonym_db.items():
        for material, synonyms in cat_data["materials"].items():
            if cleaned_input == material.lower() or cleaned_input in [s.lower() for s in synonyms]:
                return category, material  # Return category and standardized material name
    
    # If no material match, try category synonyms
    for category, cat_data in synonym_db.items():
        if cleaned_input == category.lower() or cleaned_input in [s.lower() for s in cat_data["synonyms"]]:
            return category, None  # Return category but no specific material
    
    return None, None  # No match found

# Standalone function to match a single user input
def match_user_input(user_input, synonym_db):
    category, material = map_material(user_input, synonym_db)
    if category and material:
        return {"category": category, "material": material, "match_type": "material"}
    elif category:
        return {"category": category, "material": None, "match_type": "category"}
    else:
        return {"category": None, "material": None, "match_type": "no_match"}

# Test the matching function
test_inputs = ["concrete blocks", "cement slab", "C20/25 concrete", "random input"]




merged_df = purchase_df.merge(
    climate_df,
    left_on='Matched_Produktnamn',
    right_on='Produktnamn',
    how='left'
)

merged_df['Weight_kg'] = merged_df['Volume_m3'] * merged_df['Omräkningsfaktor']
merged_df['CO2_Savings'] = merged_df['Weight_kg'] * merged_df['Total_CO2e_per_kg']

default_co2e = climate_df.groupby('Kategori')['Total_CO2e_per_kg'].mean()
merged_df['CO2_Savings'] = merged_df.apply(
    lambda row: row['Weight_kg'] * default_co2e.get(row['Kategori'], default_co2e.mean())
    if pd.isna(row['Total_CO2e_per_kg']) else row['CO2_Savings'],
    axis=1
)



# Encode categorical variables
label_encoders = {}
for col in ['Kategori', 'Enhet för omräkningsfaktor']:
    le = LabelEncoder()
    merged_df[col] = le.fit_transform(merged_df[col].astype(str))
    label_encoders[col] = le

# Select features and target
features = ['Volume_m3', 'Weight_kg', 'Omräkningsfaktor', 'Kategori', 'Enhet för omräkningsfaktor']
X = merged_df[features]
y = merged_df['CO2_Savings']


merged_df = merged_df.dropna()
X = X.dropna()
y = y.dropna()


"""
# Handle missing values in features
X = X.fillna(X.mean())

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Evaluate model
y_pred = rf.predict(X_test)
print("MSE:", mean_squared_error(y_test, y_pred))
print("R²:", r2_score(y_test, y_pred))

import joblib

joblib.dump(rf, 'rf_model.pkl')
joblib.dump(label_encoders, 'label_encoders.pkl')


translator = GoogleTranslator(source='sv', target='en')

# Function to translate text, handling empty or invalid inputs
def translate_text(text):
    try:
        if pd.isna(text) or not text.strip():
            return text  # Return original if NaN or empty
        return translator.translate(text)
    except Exception as e:
        print(f"Error translating '{text}': {e}")
        return text  # Return original text on error

# Translate Produktnamn and Kategori columns
climate_df['Produktnamn'] = climate_df['Produktnamn'].apply(translate_text)
climate_df['Kategori'] = climate_df['Kategori'].apply(translate_text)



"""
# Construct the path for the output CSV file
#output_csv_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'climate_db.csv')

# Save the filtered DataFrame to a new CSV file
#climate_df.to_csv(output_csv_path, index=False, encoding='utf-8')