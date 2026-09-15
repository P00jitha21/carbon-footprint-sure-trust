from fastapi import APIRouter, Depends
from app.database import get_db
from datetime import datetime, timedelta

router = APIRouter()

ACHIEVEMENTS = {
    "first_scan": {
        "name": "First Step",
        "description": "Upload your first receipt",
        "icon": "🎯",
        "condition": lambda stats: stats["total_scans"] >= 1
    },
    "eco_warrior": {
        "name": "Eco Warrior",
        "description": "Scan 10 receipts",
        "icon": "🌟",
        "condition": lambda stats: stats["total_scans"] >= 10
    },
    "carbon_conscious": {
        "name": "Carbon Conscious",
        "description": "Track 100kg of CO₂",
        "icon": "🌍",
        "condition": lambda stats: stats["total_carbon_kg"] >= 100
    },
    "green_shopper": {
        "name": "Green Shopper",
        "description": "Choose 5 low-carbon products",
        "icon": "🛒",
        "condition": lambda stats: stats.get("low_carbon_products", 0) >= 5
    },
    "week_streak": {
        "name": "Consistency King",
        "description": "Scan receipts 7 days in a row",
        "icon": "🔥",
        "condition": lambda stats: stats.get("streak_days", 0) >= 7
    }
}

@router.get("/achievements")
async def get_achievements(db = Depends(get_db)):
    """Get user achievements"""
    cursor = db.cursor()
    
    # Calculate stats
    total_scans = cursor.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    
    total_carbon_result = cursor.execute("SELECT SUM(total_carbon_kg) FROM scans").fetchone()
    total_carbon_kg = total_carbon_result[0] if total_carbon_result[0] else 0
    
    low_carbon_count = cursor.execute("""
        SELECT COUNT(*) FROM products WHERE carbon_kg < 5
    """).fetchone()[0]
    
    streak_days = calculate_streak(cursor)
    
    stats = {
        "total_scans": total_scans,
        "total_carbon_kg": total_carbon_kg,
        "low_carbon_products": low_carbon_count,
        "streak_days": streak_days
    }
    
    # Check achievements
    unlocked = []
    locked = []
    
    for key, achievement in ACHIEVEMENTS.items():
        is_unlocked = achievement["condition"](stats)
        
        ach_data = {
            "id": key,
            "name": achievement["name"],
            "description": achievement["description"],
            "icon": achievement["icon"],
            "unlocked": is_unlocked
        }
        
        if is_unlocked:
            unlocked.append(ach_data)
        else:
            locked.append(ach_data)
    
    return {
        "unlocked": unlocked,
        "locked": locked,
        "total_unlocked": len(unlocked),
        "total_achievements": len(ACHIEVEMENTS)
    }

def calculate_streak(cursor) -> int:
    """Calculate consecutive scan days"""
    results = cursor.execute("""
        SELECT DISTINCT DATE(created_at) as scan_date 
        FROM scans 
        ORDER BY scan_date DESC
    """).fetchall()
    
    if not results:
        return 0
    
    streak = 1
    for i in range(len(results) - 1):
        current = datetime.strptime(results[i][0], "%Y-%m-%d")
        next_date = datetime.strptime(results[i+1][0], "%Y-%m-%d")
        diff = (current - next_date).days
        
        if diff == 1:
            streak += 1
        else:
            break
    
    return streak