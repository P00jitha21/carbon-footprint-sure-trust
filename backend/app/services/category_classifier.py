from typing import Dict
import re

class CategoryClassifier:
    """Classify transactions into categories"""
    
    CATEGORY_KEYWORDS = {
        'groceries': ['whole foods', 'trader joes', 'safeway', 'kroger', 'walmart', 'target', 
                     'grocery', 'market', 'food', 'supermarket'],
        'restaurants': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'subway',
                       'pizza', 'burger', 'dining', 'bar', 'grill'],
        'gas': ['shell', 'chevron', 'exxon', 'bp', 'gas', 'fuel', 'petro'],
        'transport': ['uber', 'lyft', 'taxi', 'transit', 'metro', 'bus', 'train'],
        'utilities': ['electric', 'water', 'gas company', 'utility', 'energy'],
        'shopping': ['amazon', 'ebay', 'store', 'shop', 'mall', 'retail'],
    }
    
    CARBON_FACTORS = {
        'groceries': 0.8,  # kg CO2 per dollar
        'restaurants': 1.2,
        'gas': 2.3,
        'transport': 0.5,
        'utilities': 0.6,
        'shopping': 0.4,
        'other': 0.5
    }
    
    @staticmethod
    def classify(description: str) -> str:
        """Classify transaction description into category"""
        desc_lower = description.lower()
        
        for category, keywords in CategoryClassifier.CATEGORY_KEYWORDS.items():
            if any(keyword in desc_lower for keyword in keywords):
                return category
        
        return 'other'
    
    @staticmethod
    def estimate_carbon(category: str, amount: float) -> float:
        """Estimate carbon based on category and amount"""
        factor = CategoryClassifier.CARBON_FACTORS.get(category, 0.5)
        return amount * factor