from typing import List, Dict, Optional
import sqlite3
from fuzzywuzzy import fuzz
import re

class CarbonMatcher:
    """Match products to carbon database entries"""
    
    def __init__(self, db_conn: sqlite3.Connection):
        self.db = db_conn
    
    def match_product(self, product_name: str) -> Optional[Dict]:
        """Find best carbon match for a product"""
        
        # Try exact match first
        result = self._exact_match(product_name)
        if result:
            return result
        
        # Try fuzzy match
        result = self._fuzzy_match(product_name)
        if result:
            return result
        
        # Try keyword match
        result = self._keyword_match(product_name)
        if result:
            return result
        
        # Try category match
        result = self._category_match(product_name)
        if result:
            return result
        
        # Fallback
        return self._fallback_match()
    
    def _exact_match(self, product_name: str) -> Optional[Dict]:
        """Exact string match"""
        cursor = self.db.cursor()
        result = cursor.execute("""
            SELECT product_name, category, carbon_kg_per_unit
            FROM carbon_database
            WHERE LOWER(product_name) = LOWER(?)
            LIMIT 1
        """, (product_name,)).fetchone()
        
        if result:
            return {
                'product_name': result[0],
                'category': result[1],
                'carbon_kg': result[2],
                'match_type': 'exact',
                'confidence': 100.0
            }
        return None
    
    def _fuzzy_match(self, product_name: str, threshold: int = 80) -> Optional[Dict]:
        """Fuzzy string matching"""
        cursor = self.db.cursor()
        all_products = cursor.execute("""
            SELECT product_name, category, carbon_kg_per_unit
            FROM carbon_database
        """).fetchall()
        
        best_match = None
        best_score = 0
        
        for db_product in all_products:
            score = fuzz.ratio(product_name.lower(), db_product[0].lower())
            if score > best_score and score >= threshold:
                best_score = score
                best_match = db_product
        
        if best_match:
            return {
                'product_name': best_match[0],
                'category': best_match[1],
                'carbon_kg': best_match[2],
                'match_type': 'fuzzy',
                'confidence': float(best_score)
            }
        return None
    
    def _keyword_match(self, product_name: str) -> Optional[Dict]:
        """Match based on keywords"""
        keywords = ['beef', 'chicken', 'pork', 'fish', 'milk', 'cheese', 
                   'bread', 'rice', 'beans', 'lentils', 'tofu', 'eggs',
                   'tomato', 'potato', 'apple', 'banana', 'coffee']
        
        product_lower = product_name.lower()
        
        for keyword in keywords:
            if keyword in product_lower:
                cursor = self.db.cursor()
                result = cursor.execute("""
                    SELECT product_name, category, carbon_kg_per_unit
                    FROM carbon_database
                    WHERE LOWER(product_name) LIKE ?
                    LIMIT 1
                """, (f'%{keyword}%',)).fetchone()
                
                if result:
                    return {
                        'product_name': result[0],
                        'category': result[1],
                        'carbon_kg': result[2],
                        'match_type': 'keyword',
                        'confidence': 70.0
                    }
        return None
    
    def _category_match(self, product_name: str) -> Optional[Dict]:
        """Infer category and use average"""
        category = self._infer_category(product_name)
        
        if category:
            cursor = self.db.cursor()
            result = cursor.execute("""
                SELECT AVG(carbon_kg_per_unit), category
                FROM carbon_database
                WHERE category = ?
                GROUP BY category
            """, (category,)).fetchone()
            
            if result:
                return {
                    'product_name': f"{category.title()} (estimated)",
                    'category': result[1],
                    'carbon_kg': result[0],
                    'match_type': 'category',
                    'confidence': 50.0
                }
        return None
    
    def _infer_category(self, product_name: str) -> Optional[str]:
        """Infer category from product name"""
        name_lower = product_name.lower()
        
        categories = {
            'meat': ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'meat'],
            'seafood': ['fish', 'salmon', 'tuna', 'shrimp', 'seafood'],
            'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
            'vegetables': ['carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'potato', 'onion'],
            'fruits': ['apple', 'banana', 'orange', 'grape', 'berry'],
            'grains': ['rice', 'bread', 'pasta', 'wheat', 'oats'],
            'legumes': ['beans', 'lentils', 'chickpeas', 'tofu']
        }
        
        for category, keywords in categories.items():
            if any(keyword in name_lower for keyword in keywords):
                return category
        
        return None
    
    def _fallback_match(self) -> Dict:
        """Fallback to average carbon footprint"""
        return {
            'product_name': 'Unknown Product',
            'category': 'unknown',
            'carbon_kg': 2.5,  # Global average
            'match_type': 'fallback',
            'confidence': 30.0
        }