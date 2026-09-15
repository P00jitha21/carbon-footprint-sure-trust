from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CSVUploadRequest, CSVResponse, ReceiptResponse
from app.services.ocr_service import OCRService
from app.services.carbon_matcher import CarbonMatcher
from app.services.category_classifier import CategoryClassifier
from PIL import Image
import io
import time
from datetime import datetime

router = APIRouter()

@router.post("/upload/csv", response_model=CSVResponse)
async def upload_csv(request: CSVUploadRequest, db = Depends(get_db)):
    """Process CSV transactions"""
    start_time = time.time()
    
    cursor = db.cursor()
    
    # Create scan record
    total_amount = sum(t.amount for t in request.transactions)
    
    cursor.execute("""
        INSERT INTO scans (scan_type, total_amount, created_at)
        VALUES (?, ?, ?)
    """, ('csv', total_amount, datetime.now()))
    
    scan_id = cursor.lastrowid
    
    # Process each transaction
    results = []
    total_carbon = 0.0
    
    for txn in request.transactions:
        category = CategoryClassifier.classify(txn.description)
        carbon = CategoryClassifier.estimate_carbon(category, txn.amount)
        total_carbon += carbon
        
        # Store product
        cursor.execute("""
            INSERT INTO products (
                scan_id, product_name, price, carbon_kg, category, 
                match_type, confidence, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (scan_id, txn.description, txn.amount, carbon, category, 
              'category_estimate', 70.0, datetime.now()))
        
        results.append({
            'date': txn.date,
            'description': txn.description,
            'amount': txn.amount,
            'category': category,
            'carbon_kg': carbon
        })
    
    # Update scan total
    cursor.execute("""
        UPDATE scans SET total_carbon_kg = ?, processing_time_ms = ?
        WHERE id = ?
    """, (total_carbon, (time.time() - start_time) * 1000, scan_id))
    
    db.commit()
    
    return CSVResponse(
        scan_id=scan_id,
        total_carbon_kg=total_carbon,
        total_amount=total_amount,
        transactions=results,
        processing_time_ms=(time.time() - start_time) * 1000,
        created_at=datetime.now()
    )


@router.post("/upload/receipt", response_model=ReceiptResponse)
async def upload_receipt(file: UploadFile = File(...), db = Depends(get_db)):
    """Process receipt image with OCR"""
    start_time = time.time()
    
    # Read and validate image
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
    
    # Extract text with OCR
    ocr_service = OCRService()
    raw_text = ocr_service.extract_text(image)
    
    if not raw_text or len(raw_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract text from image")
    
    # Parse receipt
    items = ocr_service.parse_receipt(raw_text)
    
    cursor = db.cursor()
    
    # Create scan record
    cursor.execute("""
        INSERT INTO scans (scan_type, raw_text, created_at)
        VALUES (?, ?, ?)
    """, ('receipt', raw_text, datetime.now()))
    
    scan_id = cursor.lastrowid
    
    # Match products to carbon database
    matcher = CarbonMatcher(db)
    products = []
    total_carbon = 0.0
    
    for item in items:
        match = matcher.match_product(item['product_name'])
        
        if match:
            carbon_kg = match['carbon_kg'] * item['quantity']
            total_carbon += carbon_kg
            
            # Store product
            cursor.execute("""
                INSERT INTO products (
                    scan_id, product_name, quantity, price, carbon_kg,
                    category, match_type, confidence, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scan_id, match['product_name'], item['quantity'],
                item.get('price'), carbon_kg, match['category'],
                match['match_type'], match['confidence'], datetime.now()
            ))
            
            products.append({
                'product_name': match['product_name'],
                'quantity': item['quantity'],
                'price': item.get('price'),
                'carbon_kg': carbon_kg,
                'category': match['category'],
                'match_type': match['match_type'],
                'confidence': match['confidence']
            })
    
    # Update scan total
    processing_time = (time.time() - start_time) * 1000
    cursor.execute("""
        UPDATE scans SET total_carbon_kg = ?, processing_time_ms = ?
        WHERE id = ?
    """, (total_carbon, processing_time, scan_id))
    
    db.commit()
    
    return ReceiptResponse(
        scan_id=scan_id,
        total_carbon_kg=total_carbon,
        products=products,
        raw_text=raw_text,
        processing_time_ms=processing_time,
        created_at=datetime.now()
    )