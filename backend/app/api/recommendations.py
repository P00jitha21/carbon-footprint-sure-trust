from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class RecommendationRequest(BaseModel):
    product_name: str
    current_carbon_kg: float

class Recommendation(BaseModel):
    recommended_product: str
    carbon_kg: float
    carbon_saved_kg: float
    carbon_reduction_percent: float
    reason: str
    similarity_score: Optional[float] = None

@router.post("/recommendations", response_model=List[Recommendation])
async def get_recommendations(request: RecommendationRequest, db = Depends(get_db)):
    """Get lower-carbon alternatives for a product"""
    cursor = db.cursor()
    
    # Get current product details
    current_product = cursor.execute("""
        SELECT product_name, category, carbon_kg_per_unit
        FROM carbon_database
        WHERE product_name LIKE ?
        LIMIT 1
    """, (f"%{request.product_name}%",)).fetchone()
    
    if not current_product:
        # Try category-based fallback
        category = infer_category(request.product_name)
        if category:
            alternatives = cursor.execute("""
                SELECT product_name, carbon_kg_per_unit
                FROM carbon_database
                WHERE category = ?
                AND carbon_kg_per_unit < ?
                ORDER BY carbon_kg_per_unit ASC
                LIMIT 5
            """, (category, request.current_carbon_kg)).fetchall()
        else:
            raise HTTPException(status_code=404, detail="Product not found")
    else:
        # Get alternatives in same category
        alternatives = cursor.execute("""
            SELECT product_name, carbon_kg_per_unit
            FROM carbon_database
            WHERE category = ?
            AND carbon_kg_per_unit < ?
            AND product_name != ?
            ORDER BY carbon_kg_per_unit ASC
            LIMIT 5
        """, (current_product[1], request.current_carbon_kg, current_product[0])).fetchall()
    
    recommendations = []
    for alt in alternatives:
        carbon_saved = request.current_carbon_kg - alt[1]
        reduction_percent = (carbon_saved / request.current_carbon_kg) * 100 if request.current_carbon_kg > 0 else 0
        
        reason = generate_reason(alt[0], carbon_saved, reduction_percent)
        
        recommendations.append(Recommendation(
            recommended_product=alt[0],
            carbon_kg=alt[1],
            carbon_saved_kg=round(carbon_saved, 2),
            carbon_reduction_percent=round(reduction_percent, 1),
            reason=reason
        ))
    
    return recommendations

def infer_category(product_name: str) -> Optional[str]:
    """Infer category from product name"""
    name_lower = product_name.lower()
    
    categories = {
        'meat': ['beef', 'chicken', 'pork', 'lamb', 'turkey'],
        'seafood': ['fish', 'salmon', 'tuna', 'shrimp'],
        'dairy': ['milk', 'cheese', 'yogurt', 'butter'],
        'vegetables': ['carrot', 'broccoli', 'spinach', 'lettuce', 'tomato'],
        'fruits': ['apple', 'banana', 'orange', 'berry'],
        'grains': ['rice', 'bread', 'pasta', 'wheat', 'oats']
    }
    
    for category, keywords in categories.items():
        if any(keyword in name_lower for keyword in keywords):
            return category
    
    return None

def generate_reason(product_name: str, carbon_saved: float, reduction_percent: float) -> str:
    """Generate explanation for recommendation"""
    if reduction_percent > 70:
        return f"Excellent alternative! Reduces carbon by {reduction_percent:.0f}%"
    elif reduction_percent > 50:
        return f"Great choice - saves {carbon_saved:.1f}kg CO₂"
    elif reduction_percent > 30:
        return f"Good option with {reduction_percent:.0f}% less carbon"
    else:
        return "Slightly lower carbon footprint"