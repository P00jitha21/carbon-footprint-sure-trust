from fastapi import APIRouter, Depends, Query, HTTPException
from app.database import get_db
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

router = APIRouter()

class RecipeIngredient(BaseModel):
    ingredient_name: str
    amount: float
    unit: str
    carbon_kg: float

class Recipe(BaseModel):
    id: int
    name: str
    cuisine: str
    meal_type: str
    servings: int
    prep_time_minutes: int
    difficulty: str
    total_carbon_kg: float
    carbon_per_serving: float
    calories_per_serving: int
    protein_g: float
    description: str
    instructions: str
    ingredients: List[RecipeIngredient]

class MealPlan(BaseModel):
    date: str
    breakfast: Optional[Recipe] = None
    lunch: Optional[Recipe] = None
    dinner: Optional[Recipe] = None
    total_carbon_kg: float
    total_calories: int

@router.get("/recipes", response_model=List[Recipe])
async def get_recipes(
    cuisine: Optional[str] = None,
    meal_type: Optional[str] = None,
    max_carbon: Optional[float] = None,
    max_prep_time: Optional[int] = None,
    difficulty: Optional[str] = None,
    db = Depends(get_db)
):
    """Get all recipes with filters"""
    cursor = db.cursor()
    
    query = "SELECT * FROM recipes WHERE 1=1"
    params = []
    
    if cuisine:
        query += " AND cuisine = ?"
        params.append(cuisine)
    
    if meal_type:
        query += " AND meal_type = ?"
        params.append(meal_type)
    
    if max_carbon:
        query += " AND carbon_per_serving <= ?"
        params.append(max_carbon)
    
    if max_prep_time:
        query += " AND prep_time_minutes <= ?"
        params.append(max_prep_time)
    
    if difficulty:
        query += " AND difficulty = ?"
        params.append(difficulty)
    
    query += " ORDER BY carbon_per_serving ASC"
    
    results = cursor.execute(query, params).fetchall()
    
    recipes = []
    for r in results:
        ingredients = get_recipe_ingredients(cursor, r[0])
        recipes.append(Recipe(
            id=r[0],
            name=r[1],
            cuisine=r[2],
            meal_type=r[3],
            servings=r[4],
            prep_time_minutes=r[5],
            difficulty=r[6],
            total_carbon_kg=r[7],
            carbon_per_serving=r[8],
            calories_per_serving=r[9],
            protein_g=r[10],
            description=r[11],
            instructions=r[12],
            ingredients=ingredients
        ))
    
    return recipes

def get_recipe_ingredients(cursor, recipe_id: int) -> List[RecipeIngredient]:
    """Get ingredients for a recipe"""
    results = cursor.execute("""
        SELECT ingredient_name, amount, unit, carbon_kg
        FROM recipe_ingredients
        WHERE recipe_id = ?
    """, (recipe_id,)).fetchall()
    
    return [
        RecipeIngredient(
            ingredient_name=r[0],
            amount=r[1],
            unit=r[2],
            carbon_kg=r[3]
        )
        for r in results
    ]

@router.get("/meal-plan/weekly", response_model=List[MealPlan])
async def generate_weekly_meal_plan(
    target_carbon_per_day: float = Query(3.0),
    cuisines: Optional[str] = Query(None),
    db = Depends(get_db)
):
    """Generate 7-day meal plan"""
    cursor = db.cursor()
    
    cuisine_list = cuisines.split(',') if cuisines else None
    
    # Get recipe pools
    breakfast_query = "SELECT * FROM recipes WHERE meal_type = 'breakfast' AND carbon_per_serving <= 0.6"
    lunch_query = "SELECT * FROM recipes WHERE meal_type = 'lunch' AND carbon_per_serving <= 0.8"
    dinner_query = "SELECT * FROM recipes WHERE meal_type = 'dinner' AND carbon_per_serving <= 1.0"
    
    if cuisine_list:
        cuisine_filter = " AND cuisine IN ({})".format(','.join('?' * len(cuisine_list)))
        breakfast_query += cuisine_filter
        lunch_query += cuisine_filter
        dinner_query += cuisine_filter
        
        breakfasts = cursor.execute(breakfast_query, cuisine_list).fetchall()
        lunches = cursor.execute(lunch_query, cuisine_list).fetchall()
        dinners = cursor.execute(dinner_query, cuisine_list).fetchall()
    else:
        breakfasts = cursor.execute(breakfast_query).fetchall()
        lunches = cursor.execute(lunch_query).fetchall()
        dinners = cursor.execute(dinner_query).fetchall()
    
    meal_plans = []
    
    for day in range(7):
        date = (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d')
        
        breakfast = random.choice(breakfasts) if breakfasts else None
        lunch = random.choice(lunches) if lunches else None
        dinner = random.choice(dinners) if dinners else None
        
        breakfast_recipe = recipe_from_row(cursor, breakfast) if breakfast else None
        lunch_recipe = recipe_from_row(cursor, lunch) if lunch else None
        dinner_recipe = recipe_from_row(cursor, dinner) if dinner else None
        
        total_carbon = sum([
            breakfast_recipe.carbon_per_serving if breakfast_recipe else 0,
            lunch_recipe.carbon_per_serving if lunch_recipe else 0,
            dinner_recipe.carbon_per_serving if dinner_recipe else 0
        ])
        
        total_calories = sum([
            breakfast_recipe.calories_per_serving if breakfast_recipe else 0,
            lunch_recipe.calories_per_serving if lunch_recipe else 0,
            dinner_recipe.calories_per_serving if dinner_recipe else 0
        ])
        
        meal_plans.append(MealPlan(
            date=date,
            breakfast=breakfast_recipe,
            lunch=lunch_recipe,
            dinner=dinner_recipe,
            total_carbon_kg=total_carbon,
            total_calories=total_calories
        ))
    
    return meal_plans

def recipe_from_row(cursor, row) -> Recipe:
    """Convert DB row to Recipe object"""
    ingredients = get_recipe_ingredients(cursor, row[0])
    return Recipe(
        id=row[0],
        name=row[1],
        cuisine=row[2],
        meal_type=row[3],
        servings=row[4],
        prep_time_minutes=row[5],
        difficulty=row[6],
        total_carbon_kg=row[7],
        carbon_per_serving=row[8],
        calories_per_serving=row[9],
        protein_g=row[10],
        description=row[11],
        instructions=row[12],
        ingredients=ingredients
    )

@router.get("/meal-plan/shopping-list")
async def generate_shopping_list(
    recipe_ids: str = Query(...),
    db = Depends(get_db)
):
    """Generate shopping list from recipe IDs"""
    cursor = db.cursor()
    
    ids = [int(id.strip()) for id in recipe_ids.split(',')]
    
    ingredient_totals = {}
    
    for recipe_id in ids:
        results = cursor.execute("""
            SELECT ingredient_name, amount, unit, carbon_kg
            FROM recipe_ingredients
            WHERE recipe_id = ?
        """, (recipe_id,)).fetchall()
        
        for ing_name, amount, unit, carbon in results:
            key = f"{ing_name}_{unit}"
            if key in ingredient_totals:
                ingredient_totals[key]['amount'] += amount
                ingredient_totals[key]['carbon_kg'] += carbon
            else:
                ingredient_totals[key] = {
                    'ingredient_name': ing_name,
                    'amount': amount,
                    'unit': unit,
                    'carbon_kg': carbon
                }
    
    shopping_list = list(ingredient_totals.values())
    total_carbon = sum(item['carbon_kg'] for item in shopping_list)
    
    return {
        'shopping_list': shopping_list,
        'total_carbon_kg': round(total_carbon, 2),
        'total_items': len(shopping_list)
    }