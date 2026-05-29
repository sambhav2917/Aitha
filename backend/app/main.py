from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import companies, audit
from app.database import engine, Base
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aitha Admin Console API",
    description="Multi-tenant instance management and licensing lifecycle API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(companies.router)
app.include_router(audit.router)

@app.get("/")
def root():
    return {
        "message": "Aitha Admin Console API",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}