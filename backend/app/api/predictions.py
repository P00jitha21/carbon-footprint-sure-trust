from fastapi import APIRouter, Depends
from app.database import get_db
from datetime import datetime, timedelta
import numpy as np

router = APIRouter()

@router.get("/predictions/monthly")
async def predict_monthly_carbon(db = Depends(get_db)):
    """Predict next month's carbon footprint"""
    cursor = db.cursor()
    
    # Get last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    results = cursor.execute("""
        SELECT DATE(created_at) as date, SUM(total_carbon_kg) as daily_total
        FROM scans
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date
    """, (thirty_days_ago,)).fetchall()
    
    if len(results) < 7:
        return {"error": "Need at least 7 days of data for prediction"}
    
    values = [r[1] for r in results]
    
    # Simple linear trend
    daily_avg = np.mean(values)
    predicted_monthly = daily_avg * 30
    
    # Calculate trend
    x = np.arange(len(values))
    z = np.polyfit(x, values, 1)
    slope = z[0]
    
    trend = 'increasing' if slope > 0.01 else 'decreasing' if slope < -0.01 else 'stable'
    
    insights = []
    if trend == 'increasing':
        insights.append("⚠️ Your carbon footprint is trending upward")
        insights.append("Consider reviewing recent purchases for high-carbon items")
    elif trend == 'decreasing':
        insights.append("✅ Great! Your carbon footprint is trending downward")
        insights.append("Keep making green choices!")
    else:
        insights.append("Your carbon footprint is stable")
    
    return {
        'predicted_carbon_kg': round(predicted_monthly, 2),
        'daily_average': round(daily_avg, 2),
        'trend': trend,
        'insights': insights,
        'confidence': 'medium' if len(values) >= 14 else 'low'
    }

@router.get("/predictions/budget")
async def suggest_budget(db = Depends(get_db)):
    """Suggest carbon budget based on user's pattern"""
    cursor = db.cursor()
    
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    result = cursor.execute("""
        SELECT AVG(total_carbon_kg) as avg_daily
        FROM scans
        WHERE created_at >= ?
    """, (thirty_days_ago,)).fetchone()
    
    if not result or not result[0]:
        return {
            'suggested_daily_budget': 5.0,
            'suggested_monthly_budget': 150.0,
            'reasoning': 'Default budget based on average consumer'
        }
    
    avg_daily = result[0]
    current_monthly = avg_daily * 30
    
    # Suggest 15% reduction
    reduction_target = 0.15
    suggested_monthly = current_monthly * (1 - reduction_target)
    suggested_daily = suggested_monthly / 30
    
    return {
        'current_monthly_average': round(current_monthly, 2),
        'suggested_daily_budget': round(suggested_daily, 2),
        'suggested_monthly_budget': round(suggested_monthly, 2),
        'reduction_target_pct': reduction_target * 100,
        'savings_kg': round(current_monthly - suggested_monthly, 2),
        'reasoning': '15% reduction from your current pattern - an achievable goal'
    }