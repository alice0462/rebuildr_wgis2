import json
import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'synonym_db.json')
with open(json_path, 'r', encoding='utf-8') as file:
    data = json.load(file)
synonym_df = pd.DataFrame(data)



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

def calculate_volume_and_weight(height, length, width, unit, omr_faktor):
    """
    Calculate volume (m³) and weight (kg) from dimensions and Omräkningsfaktor.
    """
    # Convert dimensions to meters
    if unit == "CM":
        height_m = height / 100
        length_m = length / 100
        width_m = width / 100
    elif unit == "MM":
        height_m = height / 1000
        length_m = length / 1000
        width_m = width / 1000
    elif unit == "M":
        height_m, length_m, width_m = height, length, width
    else:
        raise ValueError(f"Unknown unit: {unit}")
    
    # Calculate volume (m³)
    volume = height_m * length_m * width_m
    
    # Calculate weight (kg)
    weight = volume * omr_faktor
    
    return volume, weight

def predict_co2_savings(purchase_data, climate_db, model):
    co2_saved = 0
    
    for index ,purchase in purchase_data.iterrows():
        try:
            produktnamn = find_material(purchase['description'],synonym_df)
            material_row = climate_db[climate_db['Produktnamn'] == produktnamn]
            omr_faktor = material_row['Omräkningsfaktor']
            volume, weight = calculate_volume_and_weight(
                purchase['height'], purchase['length'], purchase['width'], purchase
                ['Unit'], omr_faktor
            )
            
            input_data = pd.DataFrame({
            'volume':volume,
            'Kategori':[climate_df.loc[climate_df['Produktnamn'] == produktnamn, 'Kategori'].iloc[0]],
            'A1-A3':[climate_df.loc[climate_df['Produktnamn'] == produktnamn, 'A1-A3'].iloc[0]],
            'A4':[climate_df.loc[climate_df['Produktnamn'] == produktnamn, 'A4'].iloc[0]],
            'A5':[climate_df.loc[climate_df['Produktnamn'] == produktnamn, 'A5'].iloc[0]],
            'Omräkningsfaktor':[climate_df.loc[climate_df['Produktnamn'] == produktnamn, 'Omräkningsfaktor'].iloc[0]]
            })
            
            co2_savings_log_pred = model.predict(input_data)[0]
            co2_savings = np.expm1(co2_savings_log_pred)            
            
            co2_saved += co2_savings
        except Exception as e:
            #print(f"Error processing purchase {purchase['purchase_id']}: {e}", file=sys.stderr)
            continue
            
    return co2_saved


    

if __name__ == "__main__":
    
    # Load climate_df
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'climate_db.csv')
    climate_df = pd.read_csv(csv_path)
    climate_df.columns = ['Produktnamn', 'Kategori', 'A1-A3', 'A4', 'A5', 
                         'Enhet för klimatpåverkan', 'Omräkningsfaktor', 'Enhet för omräkningsfaktor']
    
    # Load model
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'co2_savings_model.joblib')
    model = joblib.load(model_path)
    
    # Define features
    features = ['Kategori', 'volume', 'A1-A3', 'A4', 'A5', 'Omräkningsfaktor']
    
    # Read purchase data from stdin (passed by Node.js)
    input_data = sys.stdin.read()
    purchase_data = json.loads(input_data)
    purchase_df = pd.DataFrame(purchase_data)
    
    results = []
    for userID in range(10):
        user_purchase_df = purchase_df[(purchase_df['buyer_id'] == userID) | (purchase_df['seller_id'] == userID)]
        user_co2_savings = predict_co2_savings(user_purchase_df, climate_df, model)/2
        results.append({'Userid': userID, 'co2_savings': int(user_co2_savings)/10})
        
    # Output result as JSON
    print(json.dumps(results))

