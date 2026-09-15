from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from typing import List, Dict, Optional
from pydantic import BaseModel

router = APIRouter()

class SupplyChainStage(BaseModel):
    stage: str
    carbon_kg: float
    percentage: float
    description: str
    icon: str
    location: Optional[str] = None
    distance_km: Optional[float] = None

class SupplyChainBreakdown(BaseModel):
    product_name: str
    total_carbon_kg: float
    stages: List[SupplyChainStage]
    recommendations: List[str]

# Stage distribution templates
STAGE_DISTRIBUTIONS = {
    'meat': {
        'production': 0.72,
        'processing': 0.12,
        'packaging': 0.06,
        'transport': 0.08,
        'retail': 0.02
    },
    'dairy': {
        'production': 0.65,
        'processing': 0.18,
        'packaging': 0.07,
        'transport': 0.07,
        'retail': 0.03
    },
    'vegetables': {
        'production': 0.45,
        'processing': 0.10,
        'packaging': 0.15,
        'transport': 0.25,
        'retail': 0.05
    },
    'fruits': {
        'production': 0.50,
        'processing': 0.08,
        'packaging': 0.12,
        'transport': 0.25,
        'retail': 0.05
    },
    'default': {
        'production': 0.50,
        'processing': 0.20,
        'packaging': 0.15,
        'transport': 0.10,
        'retail': 0.05
    }
}

STAGE_ICONS = {
    'production': '🌾',
    'processing': '🏭',
    'packaging': '📦',
    'transport': '🚛',
    'retail': '🏪'
}

STAGE_DESCRIPTIONS = {
    'production': 'Farm operations, feed, land use, methane emissions',
    'processing': 'Manufacturing, slaughter, cutting, cooking, energy use',
    'packaging': 'Container materials, plastics, cardboard, refrigeration',
    'transport': 'Distribution from farm to processor to retailer',
    'retail': 'Store refrigeration, lighting, waste'
}

@router.get("/supply-chain/{product_name}", response_model=SupplyChainBreakdown)
async def get_supply_chain_breakdown(product_name: str, db = Depends(get_db)):
    """Get detailed supply chain carbon breakdown"""
    cursor = db.cursor()
    
    # Get product from database
    result = cursor.execute("""
        SELECT 
            product_name, category, carbon_kg_per_unit,
            origin_country, transport_distance_km
        FROM carbon_database
        WHERE product_name LIKE ?
        LIMIT 1
    """, (f"%{product_name}%",)).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    
    name, category, total_carbon, origin, distance = result
    
    # Get distribution for category
    distribution = STAGE_DISTRIBUTIONS.get(category.lower(), STAGE_DISTRIBUTIONS['default'])
    
    # Calculate stages
    stages = []
    for stage_name, percentage in distribution.items():
        carbon_amount = total_carbon * percentage
        
        stage = SupplyChainStage(
            stage=stage_name.title(),
            carbon_kg=round(carbon_amount, 3),
            percentage=round(percentage * 100, 1),
            description=STAGE_DESCRIPTIONS[stage_name],
            icon=STAGE_ICONS[stage_name],
            location=origin if stage_name == 'production' else None,
            distance_km=distance if stage_name == 'transport' else None
        )
        stages.append(stage)
    
    # Sort by carbon amount
    stages.sort(key=lambda x: x.carbon_kg, reverse=True)
    
    # Generate recommendations
    recommendations = generate_recommendations(category, stages, origin)
    
    return SupplyChainBreakdown(
        product_name=name,
        total_carbon_kg=total_carbon,
        stages=stages,
        recommendations=recommendations
    )

def generate_recommendations(category: str, stages: List[SupplyChainStage], origin: str) -> List[str]:
    """Generate actionable recommendations"""
    recommendations = []
    
    highest_stage = stages[0]
    
    if highest_stage.stage.lower() == 'production':
        if category.lower() in ['meat', 'dairy']:
            recommendations.append(
                f"🌱 Production is {highest_stage.percentage}% of emissions. "
                f"Consider plant-based alternatives to reduce by up to 70%"
            )
    
    if highest_stage.stage.lower() == 'transport':
        if origin and origin.lower() not in ['usa', 'us', 'local']:
            recommendations.append(
                f"🚛 Transport from {origin} creates {highest_stage.carbon_kg}kg CO₂. "
                f"Choose local alternatives to reduce by up to {highest_stage.percentage}%"
            )
    
    if highest_stage.stage.lower() == 'packaging':
        recommendations.append(
            f"📦 Packaging creates {highest_stage.carbon_kg}kg CO₂. "
            f"Choose bulk or minimal packaging options"
        )
    
    if len(recommendations) == 0:
        recommendations.append(
            f"💡 Focus on reducing {highest_stage.stage.lower()} impact - "
            f"it's the largest contributor at {highest_stage.percentage}%"
        )
    
    return recommendations[:3]