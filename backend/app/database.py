import sqlite3
import pandas as pd
from datetime import datetime
from pathlib import Path

DATABASE_PATH = Path(__file__).parent.parent / "carbonsight.db"

def get_db():
    """Database connection generator"""
    conn = sqlite3.connect(str(DATABASE_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_database():
    """Initialize all database tables"""
    conn = sqlite3.connect(str(DATABASE_PATH))
    cursor = conn.cursor()
    
    # Scans table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_type VARCHAR(50),
            total_carbon_kg FLOAT,
            total_amount FLOAT,
            raw_text TEXT,
            processing_time_ms FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id INTEGER,
            product_name VARCHAR(200),
            quantity INTEGER,
            price FLOAT,
            carbon_kg FLOAT,
            category VARCHAR(100),
            match_type VARCHAR(50),
            confidence FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (scan_id) REFERENCES scans(id)
        )
    """)
    
    # Carbon database table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS carbon_database (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name VARCHAR(200),
            category VARCHAR(100),
            carbon_kg_per_unit FLOAT,
            unit VARCHAR(50),
            source VARCHAR(100),
            protein_g FLOAT,
            calories FLOAT,
            fat_g FLOAT,
            price_per_unit FLOAT,
            origin_country VARCHAR(100),
            transport_mode VARCHAR(50),
            transport_distance_km FLOAT,
            seasonality VARCHAR(50)
        )
    """)
    
    # Supply chain stages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS supply_chain_stages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            stage VARCHAR(50),
            carbon_kg FLOAT,
            percentage FLOAT,
            description TEXT,
            location VARCHAR(100),
            distance_km FLOAT,
            FOREIGN KEY (product_id) REFERENCES carbon_database(id)
        )
    """)
    
    # Transport emissions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transport_emissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mode VARCHAR(50) UNIQUE,
            carbon_kg_per_km FLOAT,
            description TEXT
        )
    """)
    
    # Recipes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(200),
            cuisine VARCHAR(100),
            meal_type VARCHAR(50),
            servings INTEGER,
            prep_time_minutes INTEGER,
            difficulty VARCHAR(50),
            total_carbon_kg FLOAT,
            carbon_per_serving FLOAT,
            calories_per_serving INTEGER,
            protein_g FLOAT,
            description TEXT,
            instructions TEXT,
            image_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Recipe ingredients table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER,
            ingredient_name VARCHAR(200),
            amount FLOAT,
            unit VARCHAR(50),
            carbon_kg FLOAT,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id)
        )
    """)
    
    # Nudges table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nudges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nudge_type VARCHAR(50),
            message TEXT,
            shown_count INTEGER DEFAULT 0,
            clicked_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Offset actions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS offset_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type VARCHAR(50),
            amount_kg FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    
    # Seed data
    seed_carbon_database(conn)
    seed_transport_emissions(conn)
    seed_recipes(conn)
    
    conn.close()

def seed_carbon_database(conn):
    """Seed the carbon database with initial data"""
    cursor = conn.cursor()
    
    # Check if already seeded
    count = cursor.execute("SELECT COUNT(*) FROM carbon_database").fetchone()[0]
    if count > 0:
        return
    
    products = [
        # Meats
        ("Beef", "meat", 27.0, "kg", "Poore & Nemecek 2018", 26, 250, 15, 12.0, "Brazil", "ship", 8000, "year_round"),
        ("Lamb", "meat", 24.5, "kg", "Poore & Nemecek 2018", 25, 294, 21, 14.0, "Australia", "ship", 12000, "year_round"),
        ("Pork", "meat", 7.6, "kg", "Poore & Nemecek 2018", 27, 242, 14, 8.0, "USA", "truck", 500, "year_round"),
        ("Chicken", "meat", 6.9, "kg", "Poore & Nemecek 2018", 31, 239, 14, 6.0, "USA", "truck", 300, "year_round"),
        ("Turkey", "meat", 10.9, "kg", "Poore & Nemecek 2018", 29, 189, 8, 7.0, "USA", "truck", 400, "year_round"),
        
        # Seafood
        ("Salmon", "seafood", 13.6, "kg", "Agribalyse 3.1", 20, 206, 13, 18.0, "Norway", "air", 5000, "year_round"),
        ("Tuna", "seafood", 6.1, "kg", "Agribalyse 3.1", 26, 144, 1, 15.0, "Thailand", "ship", 9000, "year_round"),
        ("Shrimp", "seafood", 26.9, "kg", "Poore & Nemecek 2018", 24, 99, 0.3, 20.0, "India", "air", 7000, "year_round"),
        ("White Fish", "seafood", 5.4, "kg", "DEFRA UK", 20, 82, 0.7, 12.0, "Iceland", "ship", 3000, "year_round"),
        
        # Dairy
        ("Milk", "dairy", 3.2, "liter", "Poore & Nemecek 2018", 3.4, 61, 3.3, 1.5, "USA", "truck", 200, "year_round"),
        ("Cheese", "dairy", 23.9, "kg", "Poore & Nemecek 2018", 25, 402, 33, 8.0, "USA", "truck", 300, "year_round"),
        ("Butter", "dairy", 23.8, "kg", "Agribalyse 3.1", 0.85, 717, 81, 6.0, "USA", "truck", 250, "year_round"),
        ("Yogurt", "dairy", 3.6, "kg", "Agribalyse 3.1", 10, 59, 0.4, 2.5, "USA", "truck", 150, "year_round"),
        ("Eggs", "dairy", 4.8, "kg", "Poore & Nemecek 2018", 13, 155, 11, 3.0, "USA", "truck", 100, "year_round"),
        
        # Vegetables
        ("Tomatoes", "vegetables", 1.4, "kg", "Poore & Nemecek 2018", 0.9, 18, 0.2, 2.0, "Mexico", "truck", 1500, "summer"),
        ("Potatoes", "vegetables", 0.5, "kg", "Poore & Nemecek 2018", 2, 77, 0.1, 1.0, "USA", "truck", 500, "fall"),
        ("Onions", "vegetables", 0.5, "kg", "Poore & Nemecek 2018", 1.1, 40, 0.1, 0.8, "USA", "truck", 400, "year_round"),
        ("Carrots", "vegetables", 0.4, "kg", "Poore & Nemecek 2018", 0.9, 41, 0.2, 1.2, "USA", "truck", 300, "fall"),
        ("Broccoli", "vegetables", 0.4, "kg", "DEFRA UK", 2.8, 34, 0.4, 2.5, "USA", "truck", 600, "fall"),
        ("Lettuce", "vegetables", 0.3, "kg", "Agribalyse 3.1", 1.4, 15, 0.2, 2.0, "USA", "truck", 200, "spring"),
        ("Spinach", "vegetables", 0.3, "kg", "Agribalyse 3.1", 2.9, 23, 0.4, 3.0, "USA", "truck", 250, "spring"),
        ("Bell Peppers", "vegetables", 0.7, "kg", "Agribalyse 3.1", 0.9, 31, 0.3, 3.5, "Mexico", "truck", 1200, "summer"),
        ("Cucumbers", "vegetables", 0.5, "kg", "Agribalyse 3.1", 0.7, 16, 0.1, 2.0, "USA", "truck", 400, "summer"),
        
        # Fruits
        ("Apples", "fruits", 0.4, "kg", "Poore & Nemecek 2018", 0.3, 52, 0.2, 1.5, "USA", "truck", 500, "fall"),
        ("Bananas", "fruits", 0.9, "kg", "Poore & Nemecek 2018", 1.1, 89, 0.3, 1.2, "Ecuador", "ship", 5000, "year_round"),
        ("Oranges", "fruits", 0.4, "kg", "Agribalyse 3.1", 0.9, 47, 0.1, 2.0, "California", "truck", 2000, "winter"),
        ("Strawberries", "fruits", 1.0, "kg", "Agribalyse 3.1", 0.7, 32, 0.3, 5.0, "Mexico", "truck", 1500, "spring"),
        ("Grapes", "fruits", 1.1, "kg", "Agribalyse 3.1", 0.7, 69, 0.2, 4.0, "Chile", "ship", 8000, "spring"),
        ("Avocados", "fruits", 2.5, "kg", "Poore & Nemecek 2018", 2, 160, 15, 3.5, "Mexico", "truck", 1800, "year_round"),
        
        # Grains
        ("Rice", "grains", 4.0, "kg", "Poore & Nemecek 2018", 7.1, 130, 0.3, 1.5, "USA", "truck", 1000, "year_round"),
        ("Wheat Bread", "grains", 1.6, "kg", "Agribalyse 3.1", 9, 265, 3.2, 2.0, "USA", "truck", 300, "year_round"),
        ("Pasta", "grains", 1.4, "kg", "Agribalyse 3.1", 13, 371, 1.5, 1.8, "Italy", "ship", 6000, "year_round"),
        ("Oats", "grains", 2.5, "kg", "Poore & Nemecek 2018", 17, 389, 6.9, 2.5, "USA", "truck", 800, "year_round"),
        ("Quinoa", "grains", 3.0, "kg", "Agribalyse 3.1", 14, 368, 6.1, 5.0, "Peru", "ship", 7000, "year_round"),
        
        # Legumes
        ("Lentils", "legumes", 0.9, "kg", "Poore & Nemecek 2018", 9, 116, 0.4, 2.0, "Canada", "ship", 3000, "year_round"),
        ("Chickpeas", "legumes", 0.9, "kg", "Poore & Nemecek 2018", 8.9, 164, 2.6, 2.2, "India", "ship", 8000, "year_round"),
        ("Black Beans", "legumes", 0.9, "kg", "Agribalyse 3.1", 8.9, 132, 0.5, 1.8, "Mexico", "truck", 1200, "year_round"),
        ("Tofu", "legumes", 3.0, "kg", "Poore & Nemecek 2018", 17, 144, 9, 2.5, "USA", "truck", 400, "year_round"),
        ("Peanuts", "legumes", 2.9, "kg", "Agribalyse 3.1", 26, 567, 49, 3.0, "USA", "truck", 500, "year_round"),
        
        # Nuts & Seeds
        ("Almonds", "nuts", 3.7, "kg", "Agribalyse 3.1", 21, 579, 50, 8.0, "California", "truck", 2000, "year_round"),
        ("Walnuts", "nuts", 1.8, "kg", "Agribalyse 3.1", 15, 654, 65, 9.0, "California", "truck", 2000, "fall"),
        
        # Beverages
        ("Coffee", "beverages", 16.5, "kg", "Poore & Nemecek 2018", 0.1, 2, 0, 12.0, "Colombia", "ship", 4000, "year_round"),
        ("Tea", "beverages", 5.6, "kg", "Agribalyse 3.1", 0, 1, 0, 8.0, "India", "ship", 8000, "year_round"),
        
        # Oils
        ("Olive Oil", "oils", 5.4, "liter", "Agribalyse 3.1", 0, 884, 100, 15.0, "Spain", "ship", 5000, "year_round"),
        ("Coconut Oil", "oils", 3.0, "liter", "Agribalyse 3.1", 0, 862, 100, 12.0, "Philippines", "ship", 9000, "year_round"),
    ]
    
    cursor.executemany("""
        INSERT INTO carbon_database (
            product_name, category, carbon_kg_per_unit, unit, source,
            protein_g, calories, fat_g, price_per_unit, origin_country,
            transport_mode, transport_distance_km, seasonality
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, products)
    
    conn.commit()
    print(f"✅ Seeded {len(products)} products into carbon database")

def seed_transport_emissions(conn):
    """Seed transport emission factors"""
    cursor = conn.cursor()
    
    count = cursor.execute("SELECT COUNT(*) FROM transport_emissions").fetchone()[0]
    if count > 0:
        return
    
    transport_data = [
        ('truck', 0.104, 'Heavy duty truck'),
        ('ship', 0.016, 'Container ship'),
        ('air', 0.602, 'Air freight'),
        ('rail', 0.041, 'Freight train'),
        ('local_truck', 0.089, 'Local delivery truck')
    ]
    
    cursor.executemany("""
        INSERT INTO transport_emissions (mode, carbon_kg_per_km, description)
        VALUES (?, ?, ?)
    """, transport_data)
    
    conn.commit()
    print(f"✅ Seeded {len(transport_data)} transport modes")

def seed_recipes(conn):
    """Seed sample recipes"""
    cursor = conn.cursor()
    
    count = cursor.execute("SELECT COUNT(*) FROM recipes").fetchone()[0]
    if count > 0:
        return
    
    recipes = [
        {
            'name': 'Lentil Buddha Bowl',
            'cuisine': 'Mediterranean',
            'meal_type': 'lunch',
            'servings': 2,
            'prep_time_minutes': 30,
            'difficulty': 'easy',
            'total_carbon_kg': 0.8,
            'carbon_per_serving': 0.4,
            'calories_per_serving': 450,
            'protein_g': 18,
            'description': 'Nutritious bowl with lentils, quinoa, roasted vegetables, and tahini dressing',
            'instructions': '''1. Cook 1 cup lentils and 1/2 cup quinoa according to package directions
2. Roast 2 cups mixed vegetables (sweet potato, broccoli, carrots) at 400°F for 25 min
3. Make tahini dressing: mix 2 tbsp tahini, lemon juice, garlic, water
4. Assemble bowls with grains, lentils, veggies, and drizzle with dressing
5. Top with fresh herbs and pumpkin seeds''',
            'ingredients': [
                ('Lentils', 200, 'g', 0.18),
                ('Quinoa', 100, 'g', 0.30),
                ('Sweet Potato', 150, 'g', 0.08),
                ('Broccoli', 100, 'g', 0.04),
                ('Carrots', 100, 'g', 0.04),
                ('Tahini', 30, 'g', 0.09),
                ('Olive Oil', 15, 'ml', 0.08),
            ]
        },
        {
            'name': 'Chickpea Curry',
            'cuisine': 'Indian',
            'meal_type': 'dinner',
            'servings': 4,
            'prep_time_minutes': 35,
            'difficulty': 'easy',
            'total_carbon_kg': 1.6,
            'carbon_per_serving': 0.4,
            'calories_per_serving': 380,
            'protein_g': 15,
            'description': 'Rich and creamy coconut chickpea curry with spinach',
            'instructions': '''1. Sauté onion, garlic, ginger in coconut oil
2. Add curry powder, turmeric, cumin - cook 1 minute
3. Add chickpeas, coconut milk, tomatoes
4. Simmer 20 minutes until thickened
5. Stir in fresh spinach, cook until wilted
6. Serve over rice with fresh cilantro''',
            'ingredients': [
                ('Chickpeas', 400, 'g', 0.36),
                ('Coconut Milk', 400, 'ml', 0.45),
                ('Tomatoes', 300, 'g', 0.42),
                ('Spinach', 200, 'g', 0.06),
                ('Rice', 300, 'g', 1.20),
                ('Onion', 100, 'g', 0.05),
                ('Spices', 20, 'g', 0.06),
            ]
        },
        {
            'name': 'Black Bean Breakfast Burrito',
            'cuisine': 'Mexican',
            'meal_type': 'breakfast',
            'servings': 2,
            'prep_time_minutes': 20,
            'difficulty': 'easy',
            'total_carbon_kg': 0.9,
            'carbon_per_serving': 0.45,
            'calories_per_serving': 480,
            'protein_g': 20,
            'description': 'Protein-packed breakfast burrito with black beans and tofu scramble',
            'instructions': '''1. Scramble crumbled tofu with turmeric, cumin, nutritional yeast
2. Warm black beans with taco seasoning
3. Warm tortillas in dry pan
4. Layer tortilla with beans, tofu scramble, salsa, avocado
5. Roll tightly and toast seam-side down until crispy''',
            'ingredients': [
                ('Black Beans', 200, 'g', 0.18),
                ('Tofu', 200, 'g', 0.60),
                ('Tortillas', 100, 'g', 0.16),
                ('Avocados', 100, 'g', 0.25),
                ('Tomatoes', 100, 'g', 0.14),
            ]
        },
    ]
    
    for recipe_data in recipes:
        ingredients = recipe_data.pop('ingredients')
        
        cursor.execute("""
            INSERT INTO recipes (
                name, cuisine, meal_type, servings, prep_time_minutes,
                difficulty, total_carbon_kg, carbon_per_serving,
                calories_per_serving, protein_g, description, instructions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            recipe_data['name'],
            recipe_data['cuisine'],
            recipe_data['meal_type'],
            recipe_data['servings'],
            recipe_data['prep_time_minutes'],
            recipe_data['difficulty'],
            recipe_data['total_carbon_kg'],
            recipe_data['carbon_per_serving'],
            recipe_data['calories_per_serving'],
            recipe_data['protein_g'],
            recipe_data['description'],
            recipe_data['instructions']
        ))
        
        recipe_id = cursor.lastrowid
        
        for ing_name, amount, unit, carbon in ingredients:
            cursor.execute("""
                INSERT INTO recipe_ingredients (recipe_id, ingredient_name, amount, unit, carbon_kg)
                VALUES (?, ?, ?, ?, ?)
            """, (recipe_id, ing_name, amount, unit, carbon))
    
    conn.commit()
    print(f"✅ Seeded {len(recipes)} recipes")