import httpx, os
import json
import re
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

def preprocess_bank_statement_text(text):
    """
    Preprocess bank statement text to improve extraction accuracy
    """
    if not text:
        return ""
    
    # Split into lines for processing
    lines = text.split('\n')
    processed_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Skip common header/footer lines that don't contain transactions
        skip_patterns = [
            'page', 'statement', 'bank', 'address', 'phone', 'email',
            'terms', 'conditions', 'notice', 'continued', 'total pages'
        ]
        
        # Check if line contains potential transaction data
        has_date = bool(re.search(r'\b\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}\b', line))
        has_amount = bool(re.search(r'[\d,]+\.\d{2}', line))
        
        # Keep lines that have transaction indicators or are not in skip patterns
        if has_date or has_amount or not any(pattern.lower() in line.lower() for pattern in skip_patterns):
            processed_lines.append(line)
    
    return '\n'.join(processed_lines)

def extract_transactions(text):
    headers = {
        "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    
    # Increase text limit and improve preprocessing
    max_text_length = 25000  # Increased from 15000
    processed_text = preprocess_bank_statement_text(text[:max_text_length])
    
    data = {
        "model": "claude-3-5-haiku-20241022",
        "max_tokens": 3000,  # Increased token limit
        "temperature": 0,
        "messages": [{
            "role": "user",
            "content": f"""You are an expert financial data analyst. Extract ALL transactions from this bank statement text and organize them into a structured JSON format.

IMPORTANT INSTRUCTIONS:
1. Find ALL transactions - don't miss any debits, credits, transfers, or fees
2. Look for date patterns like DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY
3. Look for amount patterns with currency symbols or decimal points
4. Extract account details (name, account number, currency, balance)
5. Categorize transactions as either "income" (credits/deposits) or "expenses" (debits/withdrawals)
6. Include opening and closing balances if available

REQUIRED JSON FORMAT:
{{
  "account_details": {{
    "name": "Account holder name",
    "account_number": "Account number",
    "currency": "Currency (e.g., LKR, USD)",
    "statement_date": "Statement date range"
  }},
  "final_balance": 0.00,
  "transactions": {{
    "income": [
      {{
        "date": "DDMMMYYYY format",
        "description": "Transaction description",
        "amount": 0.00
      }}
    ],
    "expenses": [
      {{
        "date": "DDMMMYYYY format", 
        "description": "Transaction description",
        "amount": 0.00
      }}
    ]
  }}
}}

Bank Statement Text:
{processed_text}

Return ONLY the JSON object, no markdown formatting or explanatory text."""
        }]
    }
    
    # Configure timeout
    timeout = httpx.Timeout(connect=30.0, read=90.0, write=30.0, pool=30.0)
    
    try:
        logger.info(f"Making API request to Anthropic with processed text length: {len(processed_text)} characters")
        
        with httpx.Client(timeout=timeout) as client:
            response = client.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
        
        logger.info(f"API response received with status: {response.status_code}")
        
    except httpx.TimeoutException as e:
        logger.error(f"API request timed out: {e}")
        return {"error": f"API request timed out after 90 seconds: {str(e)}"}
    except httpx.ConnectError as e:
        logger.error(f"Failed to connect to API: {e}")
        return {"error": f"Failed to connect to Anthropic API: {str(e)}"}
    except Exception as e:
        logger.error(f"Unexpected error during API call: {e}")
        return {"error": f"Unexpected error: {str(e)}"}
    
    # Check if request was successful
    if response.status_code != 200:
        return {"error": f"API request failed with status {response.status_code}: {response.text}"}
    
    response_data = response.json()
    
    # Check if the response has the expected structure
    if "content" not in response_data:
        return {"error": f"Unexpected API response structure: {response_data}"}
    
    if not response_data["content"] or len(response_data["content"]) == 0:
        return {"error": "No content in API response"}
    
    if "text" not in response_data["content"][0]:
        return {"error": f"No text in API response content: {response_data['content'][0]}"}
    
    raw_text = response_data["content"][0]["text"]
    logger.info(f"Raw response from Claude: {raw_text[:200]}...")
    
    # Try to extract JSON from the response
    try:
        # First, try to parse the response directly as JSON
        try:
            parsed_json = json.loads(raw_text)
            logger.info("Successfully parsed response as direct JSON")
            return parsed_json
        except json.JSONDecodeError:
            pass
        
        # If direct parsing fails, try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', raw_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(1).strip()
            logger.info(f"Extracted JSON from markdown: {json_text[:200]}...")
            parsed_json = json.loads(json_text)
            logger.info("Successfully parsed JSON from markdown block")
            return parsed_json
        
        # If no code block, try to find JSON-like content
        json_pattern = r'\{.*\}'
        json_match = re.search(json_pattern, raw_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0).strip()
            logger.info(f"Extracted JSON pattern: {json_text[:200]}...")
            parsed_json = json.loads(json_text)
            logger.info("Successfully parsed JSON from pattern match")
            return parsed_json
        
        # If all else fails, return the raw text with an error
        return {"error": f"Could not extract valid JSON from response: {raw_text[:500]}"}
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed: {e}")
        return {"error": f"Invalid JSON in response: {str(e)}. Raw text: {raw_text[:500]}"}
    except Exception as e:
        logger.error(f"Unexpected error parsing JSON: {e}")
        return {"error": f"Unexpected error parsing response: {str(e)}"}

def extract_transactions_chunked(text):
    """
    Handle very large bank statements by processing in chunks and combining results
    """
    max_chunk_size = 25000
    
    if len(text) <= max_chunk_size:
        return extract_transactions(text)
    
    logger.info(f"Text too large ({len(text)} chars), processing in chunks")
    
    # Split text into overlapping chunks to avoid missing transactions at boundaries
    chunks = []
    overlap = 2000  # Overlap to catch transactions split across chunks
    
    for i in range(0, len(text), max_chunk_size - overlap):
        chunk = text[i:i + max_chunk_size]
        chunks.append(chunk)
    
    all_income = []
    all_expenses = []
    account_details = None
    final_balance = 0
    
    for i, chunk in enumerate(chunks):
        logger.info(f"Processing chunk {i+1}/{len(chunks)}")
        result = extract_transactions(chunk)
        
        if isinstance(result, dict) and "error" not in result:
            # Collect transactions from this chunk
            if "transactions" in result:
                if "income" in result["transactions"]:
                    all_income.extend(result["transactions"]["income"])
                if "expenses" in result["transactions"]:
                    all_expenses.extend(result["transactions"]["expenses"])
            
            # Use account details from first successful chunk
            if account_details is None and "account_details" in result:
                account_details = result["account_details"]
            
            # Use the highest balance found (likely the final balance)
            if "final_balance" in result and result["final_balance"] > final_balance:
                final_balance = result["final_balance"]
    
    # Remove duplicates based on date and amount
    all_income = remove_duplicate_transactions(all_income)
    all_expenses = remove_duplicate_transactions(all_expenses)
    
    return {
        "account_details": account_details or {},
        "final_balance": final_balance,
        "transactions": {
            "income": all_income,
            "expenses": all_expenses
        }
    }

def remove_duplicate_transactions(transactions):
    """
    Remove duplicate transactions based on date, description, and amount
    """
    seen = set()
    unique_transactions = []
    
    for transaction in transactions:
        # Create a key based on date, description, and amount
        key = (
            transaction.get("date", ""),
            transaction.get("description", "").strip().lower(),
            transaction.get("amount", 0)
        )
        
        if key not in seen:
            seen.add(key)
            unique_transactions.append(transaction)
    
    return unique_transactions
