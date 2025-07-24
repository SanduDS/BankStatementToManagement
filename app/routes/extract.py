from fastapi import APIRouter, UploadFile, File, Form
from app.services.pdf_parser import pdf_to_text
from app.services.claude import extract_transactions
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
        logger.info("Starting transaction extraction with Claude API...")
        logger.info("Starting transaction extraction with Claude API...")
        data = extract_transactions(text)
        # Check if the extraction returned an error
        if isinstance(data, dict) and "error" in data:
            logger.error(f"Transaction extraction returned error: {data['error']}")
            return {"error": f"Transaction extraction failed: {data['error']}"}
        
        logger.info("Transaction extraction successful!")
        return {"extracted": data}
    except Exception as e:
        logger.error(f"Transaction extraction exception: {str(e)}")
        return {"error": f"Transaction extraction failed: {str(e)}"}

