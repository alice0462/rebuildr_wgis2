
import { CO2TREEFACTS } from "./CO2TreeFacts";


export async function calculateTreeFact(userId) {

    const response = await fetch('/data/userData.json');
    const data = await response.json();

    const user = data.find(user => user.id === userId);

    if (!user) return "User not found";
    
    const randomIndex = Math.floor(Math.random() * CO2TREEFACTS.length);

    const randomTree = CO2TREEFACTS[randomIndex]

    const co2Saved = user.totalCo2Saved;

    const calculation = Math.floor((parseInt(co2Saved) / randomTree.stores));

    return "You have saved " + co2Saved + "kg CO2e, which is equivalent to how much " + calculation + " fully grown " + randomTree.type + " trees absorbs in a year.";

}





