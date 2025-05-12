import json
import os
import pandas as pd


json_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'purchase_db.json')
with open(json_path, 'r', encoding='utf-8') as file:
    data = json.load(file)
df = pd.DataFrame(data)

results = []
#df = df[(df['buyer_id'] == 2) | (df['seller_id'] == 2)]
for userID in range(10) :
    print(userID)
    total_activity = df[(df['buyer_id'] == userID) | (df['seller_id'] == userID)]['price'].sum()
    results.append({'Userid': userID, 'economic_activity': total_activity})
    
print(results)
