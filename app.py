"""
Aurangabad Website Client Hunter - FastAPI Web Application
Author: Senior Marketer & Python Architect
"""

import os
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

import hunter_engine
import auditor
import pitch_generator

app = FastAPI(
    title="Aurangabad Website Client Hunter & Growth Platform",
    description="Full-stack client acquisition and website auditing platform for Chhatrapati Sambhajinagar",
    version="2.0.0"
)

# Enable CORS for Cloudflare Pages and external frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files directory
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Request / Response Schemas
class LeadCreateSchema(BaseModel):
    name: str
    category: str
    zone: str
    address: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    website: Optional[str] = ""
    website_status: Optional[str] = "missing"
    estimated_budget_tier: Optional[str] = "Growth (₹35,000 - ₹60,000)"
    pitch_angle: Optional[str] = "Modern Digital Presence & Lead Generation"
    tags: Optional[List[str]] = []
    notes: Optional[str] = ""
    opportunity_score: Optional[int] = 85

class LeadUpdateSchema(BaseModel):
    pipeline_stage: Optional[str] = None
    notes: Optional[str] = None
    opportunity_score: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    website_status: Optional[str] = None
    estimated_budget_tier: Optional[str] = None
    tags: Optional[List[str]] = None

class AuditRequestSchema(BaseModel):
    url: str

class PitchRequestSchema(BaseModel):
    lead: Dict[str, Any]
    audit: Optional[Dict[str, Any]] = None

class OsmHuntRequestSchema(BaseModel):
    keyword: Optional[str] = "industrial"
    zone: Optional[str] = "aurangabad"

# API Endpoints
@app.get("/")
async def root():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse("<h2>Aurangabad Client Finder App Running...</h2>")

@app.get("/api/zones")
async def get_zones():
    return {"zones": hunter_engine.AURANGABAD_ZONES}

@app.get("/api/niches")
async def get_niches():
    return {"niches": hunter_engine.AURANGABAD_NICHES}

@app.get("/api/leads")
async def list_leads(
    zone: Optional[str] = Query("all"),
    category: Optional[str] = Query("all"),
    website_status: Optional[str] = Query("all"),
    pipeline_stage: Optional[str] = Query("all"),
    search: Optional[str] = Query("")
):
    leads = hunter_engine.filter_leads(
        zone=zone,
        category=category,
        website_status=website_status,
        pipeline_stage=pipeline_stage,
        search_query=search
    )
    return {"leads": leads, "count": len(leads)}

@app.post("/api/leads")
async def create_lead(lead_data: LeadCreateSchema):
    created = hunter_engine.add_lead(lead_data.model_dump())
    return {"status": "success", "lead": created}

@app.put("/api/leads/{lead_id}")
async def update_lead_details(lead_id: str, updates: LeadUpdateSchema):
    cleaned_updates = {k: v for k, v in updates.model_dump().items() if v is not None}
    updated = hunter_engine.update_lead(lead_id, cleaned_updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "success", "lead": updated}

@app.delete("/api/leads/{lead_id}")
async def remove_lead(lead_id: str):
    success = hunter_engine.delete_lead(lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "success", "message": "Lead deleted successfully"}

@app.get("/api/stats")
async def get_dashboard_stats():
    return hunter_engine.get_stats()

@app.post("/api/audit")
async def audit_website(req: AuditRequestSchema):
    report = auditor.run_website_audit(req.url)
    return report

@app.post("/api/generate-pitch")
async def create_pitch(req: PitchRequestSchema):
    pitches = pitch_generator.generate_personalized_pitches(req.lead, req.audit)
    return pitches

@app.get("/api/export-csv")
async def export_csv():
    csv_content = hunter_engine.export_leads_csv()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=aurangabad_leads_pipeline.csv"}
    )

@app.post("/api/hunt-osm")
async def hunt_osm_live(req: OsmHuntRequestSchema):
    scraped = hunter_engine.query_openstreetmap_aurangabad(keyword=req.keyword or "industrial")
    # Automatically add unique discovered leads into the database
    existing_leads = hunter_engine.get_all_leads()
    existing_names = {l["name"].lower() for l in existing_leads}
    
    added_count = 0
    for item in scraped:
        if item["name"].lower() not in existing_names:
            hunter_engine.add_lead(item)
            existing_names.add(item["name"].lower())
            added_count += 1
            
    return {
        "status": "success",
        "discovered_count": len(scraped),
        "newly_added_count": added_count,
        "sample": scraped[:5]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
