from fastapi import APIRouter, Depends, Query
from app.database import get_db
import random

router = APIRouter()

NUDGE_MESSAGES = {
    "tip": [
        "💡 Did you know? Choosing chicken over beef once a week saves 80kg CO₂ per year!",
        "🌱 Plant-based proteins like lentils have 90% less carbon than beef",
        "🥬 Buying seasonal vegetables reduces transport emissions by up to 50%",
        "♻️ Choosing products with minimal packaging cuts carbon by 15%",
    ],
    "challenge": [
        "🎯 Challenge: Try one meat-free day this week!",
        "🏆 Can you reduce your carbon footprint by 10% this month?",
        "🌟 Challenge: Buy only local produce this week",
    ],
    "summary": [
        "📊 You've tracked {scans} purchases this week. Keep it up!",
        "🎉 Great progress! You've reduced carbon by {saved}kg this month",
    ]
}

@router.get("/nudge")
async def get_nudge(
    recent_scans: int = Query(0),
    ignored_nudges: int = Query(0),
    db = Depends(get_db)
):
    """Get personalized nudge message"""
    
    # Simple random selection for now
    nudge_type = random.choice(['tip', 'challenge', 'summary'])
    messages = NUDGE_MESSAGES[nudge_type]
    message = random.choice(messages)
    
    # Format message if needed
    if '{scans}' in message:
        message = message.format(scans=recent_scans)
    
    return {
        "nudge_type": nudge_type,
        "message": message,
        "priority": random.randint(1, 10)
    }

@router.post("/nudge/feedback")
async def submit_nudge_feedback(
    nudge_type: str = Query(...),
    clicked: bool = Query(False),
    action_taken: bool = Query(False),
    db = Depends(get_db)
):
    """Record nudge interaction"""
    
    cursor = db.cursor()
    
    cursor.execute("""
        INSERT INTO nudges (nudge_type, message, shown_count, clicked_count)
        VALUES (?, ?, 1, ?)
        ON CONFLICT(nudge_type) DO UPDATE SET
            shown_count = shown_count + 1,
            clicked_count = clicked_count + ?
    """, (nudge_type, "", 1 if clicked else 0, 1 if clicked else 0))
    
    db.commit()
    
    return {"status": "recorded"}