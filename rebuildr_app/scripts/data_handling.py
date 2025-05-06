import pandas as pd
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import matplotlib.pyplot as plt


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

def estimate_weight(volume, material_name, climate_db):
    density = climate_df.loc[climate_db['Produktnamn'] == material_name, 'Omräkningsfaktor'].iloc[0]
    return volume * density

climate_df.columns = ['Produktnamn', 'Kategori',
       'A1-A3',
       'A4',
       'A5',
       'Enhet för klimatpåverkan', 'Omräkningsfaktor',
       'Enhet för omräkningsfaktor']

print(climate_df['Omräkningsfaktor'].unique().size)


"""
training_data = []
for _, row in climate_df.iterrows():
    for _ in range(10):
        volume = np.random.uniform(0.001, 5)
        weight = estimate_weight(volume, row['Produktnamn'],climate_df)
        co2_factor = row['A1-A3']+row['A4']+row['A5']
        co2 = weight * co2_factor
        training_data.append({
            'category': row['Produktnamn'],
            'volume': volume,
            'weight': weight,
            'density': row['Omräkningsfaktor'],
            'co2_factor': co2_factor,
            'co2_emissions': co2
        })
train_df = pd.DataFrame(training_data)
print(train_df)

# Example usage
synonyms = synonym_df["Bruk och bindemedel"]["synonyms"]  # ['concrete', 'cement', ...]
desc = "hardwood planks"
omrakningsfaktor = climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'Omräkningsfaktor'].iloc[0]
#print(climate_df.loc[climate_df['Produktnamn'] == 'Spånskiva', 'A1-A3 resursens klimatpåverkan, konservativt värde'].iloc[0])
print(climate_df.columns)

import time

# Record start time
start_time = time.time()

purchase_df['Matched_Produktnamn'] = purchase_df['description'].apply(
    lambda x: find_material(x, synonym_df)
)
print(purchase_df)

end_time = time.time()
elapsed_time = end_time - start_time

print(f"Execution time: {elapsed_time:.2f} seconds")
"""