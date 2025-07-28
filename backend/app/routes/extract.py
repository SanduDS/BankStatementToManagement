from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.services.pdf_parser import pdf_to_text
from app.services.claude import extract_transactions_chunked
from app.services.csv_export import CSVExportService
import logging
import os
import tempfile

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload/")
async def upload_statement(file: UploadFile = File(...), password: str = Form(None)):
    """
    Enhanced bank statement upload and analysis with validation and CSV export
    """
    logger.info(f"Received file: {file.filename}, size: {file.size} bytes")
    
    # Validate file size (max 50MB)
    if file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size too large. Maximum allowed size is 50MB.")
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        content = await file.read()
        temp_file.write(content)
        filepath = temp_file.name
    
    logger.info(f"File saved to: {filepath}, written bytes: {len(content)}")
    
    try:
        # Step 1: Extract text from PDF
        try:
            text = pdf_to_text(filepath, password)
            logger.info(f"PDF parsing successful. Extracted text length: {len(text)} characters")
            logger.info(f"First 200 characters of extracted text: {text[:200]}...")
        except Exception as e:
            logger.error(f"PDF parsing failed: {str(e)}")
            return JSONResponse(
                status_code=400,
                content={
                    "error": f"PDF parsing failed: {str(e)}",
                    "error_type": "pdf_parsing_error",
                    "suggestions": [
                        "Ensure the PDF is not corrupted",
                        "Check if the correct password was provided for protected PDFs",
                        "Try downloading the statement again from your bank"
                    ]
                }
            )
        
        # Step 2: Validate that this is a bank statement
        try:
            # Import here to avoid circular imports
            from app.services.validators import validate_bank_statement_pdf
            validation_result = validate_bank_statement_pdf(filepath, file.filename, text)
            
            if not validation_result["is_valid"]:
                logger.warning(f"Bank statement validation failed: {validation_result['error']}")
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": validation_result["error"],
                        "error_type": "invalid_bank_statement",
                        "confidence": validation_result.get("confidence", 0),
                        "analysis": validation_result.get("analysis", {}),
                        "suggestions": validation_result.get("suggestions", [])
                    }
                )
            
            logger.info(f"Bank statement validation passed with confidence: {validation_result['confidence']}")
        
        except Exception as e:
            logger.warning(f"Validation service error: {str(e)} - proceeding with extraction")
        
        # Step 3: Extract transactions using Claude AI
        try:
            logger.info("Starting transaction extraction with Claude API (chunked processing)...")
            data = extract_transactions_chunked(text)
            
            # Check if the extraction returned an error
            if isinstance(data, dict) and "error" in data:
                logger.error(f"Transaction extraction returned error: {data['error']}")
                return JSONResponse(
                    status_code=500,
                    content={
                        "error": f"AI analysis failed: {data['error']}",
                        "error_type": "ai_analysis_error",
                        "suggestions": [
                            "The document may contain unusual formatting",
                            "Try a different bank statement format",
                            "Contact support if the issue persists"
                        ]
                    }
                )
            
            # Log summary of extracted data
            if isinstance(data, dict) and "transactions" in data:
                income_count = len(data["transactions"].get("income", []))
                expense_count = len(data["transactions"].get("expenses", []))
                logger.info(f"Transaction extraction successful! Found {income_count} income and {expense_count} expense transactions")
                
                # Validate data structure
                validated_data = validate_extraction_data(data)
                
                # Step 4: Generate CSV exports
                try:
                    csv_service = CSVExportService()
                    csv_data = csv_service.export_all_data(validated_data)
                    logger.info("CSV export generation successful")
                except Exception as e:
                    logger.warning(f"CSV export failed: {str(e)} - continuing without CSV data")
                    csv_data = {}
                
                return JSONResponse(
                    content={
                        "success": True,
                        "extracted": validated_data,
                        "csv_exports": csv_data,
                        "metadata": {
                            "total_transactions": income_count + expense_count,
                            "income_transactions": income_count,
                            "expense_transactions": expense_count,
                            "processing_time": "Complete",
                            "confidence": validation_result.get("confidence", 1.0) if 'validation_result' in locals() else 1.0
                        }
                    }
                )
            
            return JSONResponse(content={"extracted": data})
            
        except Exception as e:
            logger.error(f"Transaction extraction exception: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": f"AI analysis failed: {str(e)}",
                    "error_type": "ai_processing_error",
                    "suggestions": [
                        "The document may be too complex for automatic processing",
                        "Ensure the PDF contains clear, readable text",
                        "Try uploading a simpler bank statement format"
                    ]
                }
            )
    
    finally:
        # Clean up temporary file
        try:
            os.unlink(filepath)
        except Exception as e:
            logger.warning(f"Failed to clean up temporary file: {e}")

@router.post("/export-csv/")
async def export_csv(data: dict, export_type: str = "transactions"):
    """
    Export bank statement data to CSV format
    
    export_type options:
    - "transactions": All transactions
    - "summary": Account summary
    - "monthly": Monthly breakdown
    - "categories": Category analysis
    - "all": All exports in a zip file
    """
    try:
        csv_service = CSVExportService()
        
        if export_type == "all":
            csv_data = csv_service.export_all_data(data)
            # Return all CSV data as JSON (frontend can create downloads)
            return JSONResponse(content={
                "success": True,
                "csv_exports": csv_data,
                "export_type": "all"
            })
        
        # Single export type
        if export_type == "transactions":
            csv_content = csv_service.export_transactions(data)
        elif export_type == "summary":
            csv_content = csv_service.export_account_summary(data)
        elif export_type == "monthly":
            csv_content = csv_service.export_monthly_summary(data)
        elif export_type == "categories":
            csv_content = csv_service.export_category_summary(data)
        else:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid export type. Use: transactions, summary, monthly, categories, or all"}
            )
        
        return JSONResponse(content={
            "success": True,
            "csv_content": csv_content,
            "export_type": export_type
        })
        
    except Exception as e:
        logger.error(f"CSV export failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"CSV export failed: {str(e)}"}
        )

def validate_extraction_data(data):
    """
    Validate and ensure the extracted data has the correct structure
    """
    validated = {
        "account_details": {
            "name": data.get("account_details", {}).get("name", "Unknown"),
            "account_number": data.get("account_details", {}).get("account_number", "Unknown"),
            "currency": data.get("account_details", {}).get("currency", "LKR"),
            "statement_date": data.get("account_details", {}).get("statement_date", "Unknown")
        },
        "final_balance": float(data.get("final_balance", 0)),
        "transactions": {
            "income": [],
            "expenses": []
        }
    }
    
    # Validate income transactions
    for transaction in data.get("transactions", {}).get("income", []):
        if validate_transaction(transaction):
            validated["transactions"]["income"].append(transaction)
    
    # Validate expense transactions
    for transaction in data.get("transactions", {}).get("expenses", []):
        if validate_transaction(transaction):
            validated["transactions"]["expenses"].append(transaction)
    
    return validated

def validate_transaction(transaction):
    """
    Validate individual transaction structure
    """
    return (
        isinstance(transaction, dict) and
        "date" in transaction and
        "description" in transaction and
        "amount" in transaction and
        isinstance(transaction["amount"], (int, float)) and
        transaction["amount"] > 0
    )

