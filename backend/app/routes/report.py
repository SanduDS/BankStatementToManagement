from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from app.services.pdf_generator import generate_statement_report
from app.auth.middleware import get_current_user
from typing import Dict, Any
import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate-report/")
async def generate_pdf_report(
    data: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generate a PDF report from bank statement data
    
    Expected data format:
    {
        "account_details": {...},
        "transactions": {
            "income": [...],
            "expenses": [...]
        },
        "final_balance": 0.0
    }
    """
    try:
        logger.info(f"PDF report generation requested by user: {current_user.get('username', current_user.get('user_id'))}")
        
        # Generate the PDF report
        pdf_path = generate_statement_report(data)
        
        # Check if file was created successfully
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Failed to generate PDF report")
        
        # Return the file as a download
        filename = f"bank_statement_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for report service"""
    return {"status": "healthy", "service": "PDF Report Generator"}
