import os
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from fastapi import FastAPI
from supabase import create_client, Client
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

app = FastAPI()

class Project(BaseModel):
    id: str
    name: str
    created_at: str
    updated_at: str

class Locale(BaseModel):
    code: str
    name: str
    created_at: str

class TranslationValue(BaseModel):
    value: str
    updated_at: str
    updated_by: str

class TranslationKey(BaseModel):
    id: str
    key: str
    category: str
    description: Optional[str] = None
    translations: Dict[str, TranslationValue]

class TranslationKeyCreate(BaseModel):
    key: str
    category: str
    description: Optional[str] = None

class TranslationUpdate(BaseModel):
    value: str
    updated_by: str

@app.get("/projects", response_model=List[Project])
async def get_projects() -> List[Project]:
    try:
        response = supabase.table("projects")\
            .select("id, name, created_at, updated_at")\
            .order("name")\
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/locales", response_model=List[Locale])
async def get_locales() -> List[Locale]:
    try:
        response = supabase.table("locales")\
            .select("code, name, created_at")\
            .order("name")\
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

## This is the endpoint to get the localizations for a project and locale
## It returns a JSON object with the localizations for the project and locale
@app.get("/localizations/{project_id}/{locale}")
async def get_localizations(project_id: str, locale: str) -> Dict[str, Any]:
    try:
        # First verify the project exists
        project = supabase.table("projects").select("id").eq("id", project_id).execute()
        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Verify the locale exists
        locale_check = supabase.table("locales").select("code").eq("code", locale).execute()
        if not locale_check.data:
            raise HTTPException(status_code=404, detail="Locale not found")
        
        # Get all translation keys and their values for the project
        response = supabase.table("translation_keys")\
            .select("""
                id,
                key,
                category,
                description,
                translation_values!inner(
                    locale_code,
                    value,
                    updated_at,
                    updated_by
                )
            """)\
            .eq("project_id", project_id)\
            .eq("translation_values.locale_code", locale)\
            .execute()
        
        # Transform the data into the expected format
        localizations = {}
        for item in response.data:
            translations = {}
            for tv in item["translation_values"]:
                translations[tv["locale_code"]] = {
                    "value": tv["value"],
                    "updated_at": tv["updated_at"],
                    "updated_by": tv["updated_by"]
                }
            
            localizations[item["key"]] = {
                "id": item["id"],
                "category": item["category"],
                "description": item["description"],
                "translations": translations
            }
        
        return {
            "project_id": project_id,
            "locale": locale,
            "localizations": localizations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add a new endpoint to create/update localizations
@app.post("/localizations/{project_id}/{locale}")
async def update_localizations(
    project_id: str,
    locale: str,
    updates: Dict[str, TranslationUpdate]
):
    try:
        # Verify project and locale exist
        project = supabase.table("projects").select("id").eq("id", project_id).execute()
        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        locale_check = supabase.table("locales").select("code").eq("code", locale).execute()
        if not locale_check.data:
            raise HTTPException(status_code=404, detail="Locale not found")
        
        # Get existing translation keys for the project
        existing_keys = supabase.table("translation_keys")\
            .select("id, key")\
            .eq("project_id", project_id)\
            .in_("key", list(updates.keys()))\
            .execute()
        
        # Create a mapping of key to translation_key_id
        key_to_id = {item["key"]: item["id"] for item in existing_keys.data}
        
        # Prepare records for translation_values
        translation_records = []
        for key, update in updates.items():
            if key not in key_to_id:
                # Create new translation key if it doesn't exist
                new_key = supabase.table("translation_keys")\
                    .insert({
                        "project_id": project_id,
                        "key": key,
                        "category": "general",  # Default category, you might want to make this configurable
                        "description": None
                    })\
                    .execute()
                key_to_id[key] = new_key.data[0]["id"]
            
            # Get existing translation value if it exists
            existing_value = supabase.table("translation_values")\
                .select("id")\
                .eq("translation_key_id", key_to_id[key])\
                .eq("locale_code", locale)\
                .execute()
            
            record = {
                "translation_key_id": key_to_id[key],
                "locale_code": locale,
                "value": update.value,
                "updated_by": "currentUser"
            }
            
            # If we have an existing record, include its ID for the upsert
            if existing_value.data:
                record["id"] = existing_value.data[0]["id"]
            
            translation_records.append(record)
        
        # Upsert the translation values
        if translation_records:
            response = supabase.table("translation_values")\
                .upsert(
                    translation_records,
                    on_conflict="translation_key_id,locale_code"  # Specify the unique constraint
                )\
                .execute()
        
        return {
            "message": "Localizations updated successfully",
            "updated_count": len(translation_records)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add new endpoint to create translation keys
@app.post("/translation-keys/{project_id}")
async def create_translation_key(
    project_id: str,
    translation_key: TranslationKeyCreate
):
    try:
        # Verify project exists
        project = supabase.table("projects").select("id").eq("id", project_id).execute()
        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create new translation key
        response = supabase.table("translation_keys")\
            .insert({
                "project_id": project_id,
                "key": translation_key.key,
                "category": translation_key.category,
                "description": translation_key.description
            })\
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
