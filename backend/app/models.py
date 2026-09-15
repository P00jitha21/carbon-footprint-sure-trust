from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Transaction(BaseModel):
    date: str
    description: str
    amount: float

class CSVUploadRequest(BaseModel):
    transactions: List[Transaction]

class Product(BaseModel):
    product_name: str
    quantity: int
    price: Optional[float] = None
    carbon_kg: float
    category: str
    match_type: str
    confidence: float

class ReceiptResponse(BaseModel):
    scan_id: int
    total_carbon_kg: float
    products: List[Product]
    raw_text: str
    processing_time_ms: float
    created_at: datetime

class TransactionResult(BaseModel):
    date: str
    description: str
    amount: float
    category: str
    carbon_kg: float

class CSVResponse(BaseModel):
    scan_id: int
    total_carbon_kg: float
    total_amount: float
    transactions: List[TransactionResult]
    processing_time_ms: float
    created_at: datetime