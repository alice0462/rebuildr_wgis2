
import { CO2TREEFACTS } from "./CO2TreeFacts";


export async function calculateTreeFact(userId,co2Savings) {

    const response = await fetch('/data/user_db.json');
    const data = await response.json();

    const user = data.find(user => user.user_id === userId);

    if (!user) return "User not found";
    
    const randomIndex = Math.floor(Math.random() * CO2TREEFACTS.length);

    const randomTree = CO2TREEFACTS[randomIndex]

    const co2Saved = co2Savings[userId].co2_savings;

    const calculation = Math.floor((parseInt(co2Saved) / randomTree.stores));

    if (randomIndex < 7) {
        return "You have saved " + co2Saved + " Kg CO₂ which is equivalent to how much " + calculation + " fully grown " + randomTree.type + " trees absorbs in a year."}
    else if (6 < randomIndex < 9){
        return "You have saved " + co2Saved + " Kg CO₂ which is equivalent to how much " + calculation + " " + randomTree.type + " costs."
    }

}





