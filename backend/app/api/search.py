from fastapi import APIRouter, Depends, Query
from app.database import get_db

router = APIRouter()

@router.get("/search")
async def search_products(
    query: str = Query(..., min_length=2),
    limit: int = Query(20, le=100),
    db = Depends(get_db)
):
    """Search carbon database"""
    cursor = db.cursor()
    
    results = cursor.execute("""
        SELECT 
            product_name,
            category,
            carbon_kg_per_unit,
            unit,
            source
        FROM carbon_database
        WHERE product_name LIKE ? OR category LIKE ?
        ORDER BY carbon_kg_per_unit ASC
        LIMIT ?
    """, (f"%{query}%", f"%{query}%", limit)).fetchall()
    
    products = [
        {
            "product_name": r[0],
            "category": r[1],
            "carbon_kg": r[2],
            "unit": r[3],
            "source": r[4],
            "rating": get_carbon_rating(r[2])
        }
        for r in results
    ]
    
    return {
        "query": query,
        "results": products,
        "total": len(products)
    }

def get_carbon_rating(carbon_kg: float) -> str:
    """Rate carbon footprint"""
    if carbon_kg < 1:
        return "excellent"
    elif carbon_kg < 3:
        return "good"
    elif carbon_kg < 10:
        return "moderate"
    else:
        return "high"