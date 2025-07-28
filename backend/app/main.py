from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.extract import router as extract_router
from app.routes.report import router as report_router
import os

app = FastAPI(
    title="Bank Statement Analyzer API",
    description="API for analyzing bank statements using AI and generating PDF reports",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
origins = [
    "http://localhost:3000",
    "http://localhost:3001",  # Add port 3001 for frontend
    "http://localhost:5173",
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:3001",  # Add port 3001 for frontend
    "http://127.0.0.1:5173",
]

# Add environment-specific origins
if os.getenv("ENVIRONMENT") == "production":
    # Add your production frontend URLs here
    origins.extend([
        "https://your-frontend-domain.com",  # Replace with actual frontend URL
    ])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract_router, prefix="/api")
app.include_router(report_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Bank Statement Analyzer API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
