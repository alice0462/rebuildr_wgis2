//radera jag tror inte den behövs

export async function starReviewCalculator(userId) {

    const response = await fetch('/data/user_db.json');
    const data = await response.json();
    const user = data.find(user => user.user_id === userId);
    if (!user) return "User not found";

    const rating = user.rating;
    
    

}