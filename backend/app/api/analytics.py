from fastapi import APIRouter, Depends, Query
from app.database import get_db
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

@router.get("/analytics/summary")
async def get_summary(db = Depends(get_db)):
    """Get overall analytics summary"""
    cursor = db.cursor()
    
    # Total scans
    total_scans = cursor.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    
    # CSV vs Receipt breakdown
    csv_scans = cursor.execute(
        "SELECT COUNT(*) FROM scans WHERE scan_type = 'csv'"
    ).fetchone()[0]
    
    receipt_scans = cursor.execute(
        "SELECT COUNT(*) FROM scans WHERE scan_type = 'receipt'"
    ).fetchone()[0]
    
    # Total carbon
    total_carbon_result = cursor.execute(
        "SELECT SUM(total_carbon_kg) FROM scans"
    ).fetchone()
    total_carbon_kg = total_carbon_result[0] if total_carbon_result[0] else 0.0
    
    # Average per scan
    avg_carbon = total_carbon_kg / total_scans if total_scans > 0 else 0.0
    
    return {
        "total_scans": total_scans,
        "csv_scans": csv_scans,
        "receipt_scans": receipt_scans,
        "total_carbon_kg": round(total_carbon_kg, 2),
        "avg_carbon_per_scan": round(avg_carbon, 2)
    }


@router.get("/analytics/category-breakdown")
async def get_category_breakdown(db = Depends(get_db)):
    """Get carbon emissions by category"""
    cursor = db.cursor()
    
    results = cursor.execute("""
        SELECT category, SUM(carbon_kg) as total_carbon
        FROM products
        GROUP BY category
        ORDER BY total_carbon DESC
    """).fetchall()
    
    categories = {row[0]: round(row[1], 2) for row in results}
    
    return {"categories": categories}


@router.get("/analytics/timeline")
async def get_timeline(days: int = Query(30, ge=1, le=365), db = Depends(get_db)):
    """Get carbon emissions over time"""
    cursor = db.cursor()
    
    start_date = datetime.now() - timedelta(days=days)
    
    results = cursor.execute("""
        SELECT 
            DATE(created_at) as date,
            SUM(total_carbon_kg) as carbon_kg,
            scan_type
        FROM scans
        WHERE created_at >= ?
        GROUP BY DATE(created_at), scan_type
        ORDER BY date DESC
    """, (start_date,)).fetchall()
    
    timeline = [
        {
            "date": row[0],
            "carbon_kg": round(row[1], 2),
            "scan_type": row[2]
        }
        for row in results
    ]
    
    return {"timeline": timeline}


@router.get("/analytics/unique-products")
async def get_unique_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """Get unique products with aggregated data"""
    cursor = db.cursor()
    
    offset = (page - 1) * page_size
    
    # Get total count
    total = cursor.execute("""
        SELECT COUNT(DISTINCT product_name) FROM products
    """).fetchone()[0]
    
    # Get paginated results
    results = cursor.execute("""
        SELECT 
            product_name,
            category,
            match_type,
            SUM(carbon_kg) as total_carbon,
            COUNT(*) as purchase_count,
            MAX(created_at) as last_purchase
        FROM products
        GROUP BY product_name, category, match_type
        ORDER BY total_carbon DESC
        LIMIT ? OFFSET ?
    """, (page_size, offset)).fetchall()
    
    products = [
        {
            "product_name": row[0],
            "category": row[1],
            "match_type": row[2],
            "carbon_kg": round(row[3], 2),
            "count": row[4],
            "date": row[5]
        }
        for row in results
    ]
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/analytics/top-products")
async def get_top_products(limit: int = Query(10, ge=1, le=50), db = Depends(get_db)):
    """Get top carbon-emitting products"""
    cursor = db.cursor()
    
    results = cursor.execute("""
        SELECT 
            product_name,
            category,
            SUM(carbon_kg) as total_carbon,
            COUNT(*) as frequency
        FROM products
        GROUP BY product_name, category
        ORDER BY total_carbon DESC
        LIMIT ?
    """, (limit,)).fetchall()
    
    products = [
        {
            "product_name": row[0],
            "category": row[1],
            "total_carbon_kg": round(row[2], 2),
            "frequency": row[3]
        }
        for row in results
    ]
    
    return {"products": products}