from fastapi import APIRouter, UploadFile, File, Form
from app.services.pdf_parser import pdf_to_text
from app.services.claude import extract_transactions_chunked
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload/")
async def upload_statement(file: UploadFile = File(...), password: str = Form(None)):
    logger.info(f"Received file: {file.filename}, size: {file.size} bytes")
    
    filepath = f"/tmp/{file.filename}"
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    logger.info(f"File saved to: {filepath}, written bytes: {len(content)}")
    
    try:
        text = pdf_to_text(filepath, password)
        logger.info(f"PDF parsing successful. Extracted text length: {len(text)} characters")
        logger.info(f"First 200 characters of extracted text: {text[:200]}...")
    except Exception as e:
        logger.error(f"PDF parsing failed: {str(e)}")
        return {"error": f"PDF parsing failed: {str(e)}"}
    
    try:
        logger.info("Starting transaction extraction with Claude API (chunked processing)...")
        data = extract_transactions_chunked(text)  # Use chunked processing
        
        # Check if the extraction returned an error
        if isinstance(data, dict) and "error" in data:
            logger.error(f"Transaction extraction returned error: {data['error']}")
            return {"error": f"Transaction extraction failed: {data['error']}"}
        
        # Log summary of extracted data
        if isinstance(data, dict) and "transactions" in data:
            income_count = len(data["transactions"].get("income", []))
            expense_count = len(data["transactions"].get("expenses", []))
            logger.info(f"Transaction extraction successful! Found {income_count} income and {expense_count} expense transactions")
            
            # Validate data structure
            validated_data = validate_extraction_data(data)
            return {"extracted": validated_data}
        
        return {"extracted": data}
    except Exception as e:
        logger.error(f"Transaction extraction exception: {str(e)}")
        return {"error": f"Transaction extraction failed: {str(e)}"}

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

