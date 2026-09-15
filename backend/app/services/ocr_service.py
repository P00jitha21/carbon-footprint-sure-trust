import cv2
import numpy as np
from PIL import Image
import pytesseract
import re
from typing import List, Dict

class OCRService:
    """Extract text from receipt images"""
    
    @staticmethod
    def preprocess_image(image: Image.Image) -> np.ndarray:
        """Preprocess image for better OCR"""
        # Convert to numpy array
        img_array = np.array(image)
        
        # Convert to grayscale
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh)
        
        return denoised
    
    @staticmethod
    def extract_text(image: Image.Image) -> str:
        """Extract text from image using Tesseract OCR"""
        preprocessed = OCRService.preprocess_image(image)
        
        # Configure Tesseract
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(preprocessed, config=custom_config)
        
        return text
    
    @staticmethod
    def parse_receipt(text: str) -> List[Dict]:
        """Parse receipt text into structured data"""
        lines = text.split('\n')
        items = []
        
        # Pattern to match: product name and price
        price_pattern = r'\$?\d+\.\d{2}'
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 3:
                continue
            
            # Find prices in line
            prices = re.findall(price_pattern, line)
            
            if prices:
                # Extract product name (everything before the price)
                price_str = prices[-1]
                price_index = line.rfind(price_str)
                product_name = line[:price_index].strip()
                
                # Clean product name
                product_name = re.sub(r'^\d+\s*x?\s*', '', product_name)  # Remove quantity prefix
                product_name = re.sub(r'[^\w\s-]', '', product_name)  # Remove special chars
                
                if len(product_name) > 2:
                    price = float(price_str.replace('$', ''))
                    
                    items.append({
                        'product_name': product_name,
                        'price': price,
                        'quantity': 1  # Default quantity
                    })
        
        return items