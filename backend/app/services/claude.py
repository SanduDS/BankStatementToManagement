import httpx, os
import json
import re
from dotenv import load_dotenv
import logging
from datetime import datetime
import time
import random

load_dotenv()
logger = logging.getLogger(__name__)

# Claude 3.5 Sonnet pricing (as of 2024)
CLAUDE_INPUT_COST_PER_TOKEN = 0.000003  # $3 per million input tokens
CLAUDE_OUTPUT_COST_PER_TOKEN = 0.000015  # $15 per million output tokens

# Retry configuration
MAX_RETRIES = 3
BASE_DELAY = 1  # Base delay in seconds
MAX_DELAY = 10  # Maximum delay in seconds

def calculate_api_cost(input_tokens, output_tokens):
    """
    Calculate the cost of API usage based on token counts
    """
    input_cost = input_tokens * CLAUDE_INPUT_COST_PER_TOKEN
    output_cost = output_tokens * CLAUDE_OUTPUT_COST_PER_TOKEN
    total_cost = input_cost + output_cost
    
    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "input_cost_usd": round(input_cost, 6),
        "output_cost_usd": round(output_cost, 6),
        "total_cost_usd": round(total_cost, 6),
        "timestamp": datetime.utcnow().isoformat()
    }

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

def make_api_request_with_retry(headers, data, timeout):
    """
    Make API request with exponential backoff retry logic
    """
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"API request attempt {attempt + 1}/{MAX_RETRIES}")
            
            with httpx.Client(timeout=timeout) as client:
                response = client.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
            
            # Check if the request was successful
            if response.status_code == 200:
                logger.info(f"API request successful on attempt {attempt + 1}")
                return response
            elif response.status_code == 529:  # Overloaded
                if attempt < MAX_RETRIES - 1:  # Don't retry on last attempt
                    delay = min(BASE_DELAY * (2 ** attempt) + random.uniform(0, 1), MAX_DELAY)
                    logger.warning(f"API overloaded (529), retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                    continue
                else:
                    logger.error(f"API still overloaded after {MAX_RETRIES} attempts")
                    return response
            elif response.status_code == 429:  # Rate limited
                if attempt < MAX_RETRIES - 1:
                    delay = min(BASE_DELAY * (2 ** attempt) + random.uniform(0, 1), MAX_DELAY)
                    logger.warning(f"Rate limited (429), retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                    continue
                else:
                    logger.error(f"Rate limited after {MAX_RETRIES} attempts")
                    return response
            else:
                # For other status codes, don't retry
                logger.error(f"API request failed with status {response.status_code}")
                return response
                
        except httpx.TimeoutException as e:
            if attempt < MAX_RETRIES - 1:
                delay = min(BASE_DELAY * (2 ** attempt), MAX_DELAY)
                logger.warning(f"Request timeout on attempt {attempt + 1}, retrying in {delay:.2f} seconds...")
                time.sleep(delay)
                continue
            else:
                logger.error(f"Request timed out after {MAX_RETRIES} attempts")
                raise e
        except httpx.ConnectError as e:
            if attempt < MAX_RETRIES - 1:
                delay = min(BASE_DELAY * (2 ** attempt), MAX_DELAY)
                logger.warning(f"Connection error on attempt {attempt + 1}, retrying in {delay:.2f} seconds...")
                time.sleep(delay)
                continue
            else:
                logger.error(f"Connection failed after {MAX_RETRIES} attempts")
                raise e
        except Exception as e:
            logger.error(f"Unexpected error on attempt {attempt + 1}: {str(e)}")
            if attempt == MAX_RETRIES - 1:
                raise e
            
    return None  # Should never reach here

def extract_transactions(text):
    headers = {
        "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    
    # Increase text limit and improve preprocessing
    max_text_length = 30000  # Increased from 25000
    processed_text = preprocess_bank_statement_text(text[:max_text_length])
    
    data = {
        "model": "claude-3-5-sonnet-20241022",  # Using more powerful model
        "max_tokens": 4000,  # Increased token limit
        "temperature": 0,
        "messages": [{
            "role": "user",
            "content": f"""You are an expert financial data analyst specializing in bank statement analysis. Your task is to extract ALL transactions from the provided bank statement text with maximum accuracy and completeness.

CRITICAL ANALYSIS REQUIREMENTS:
1. COMPREHENSIVE EXTRACTION: Find every single transaction - credits, debits, transfers, fees, charges, and automated payments
2. DATE RECOGNITION: Identify all date formats including DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, DDMMMYYYY
3. AMOUNT PRECISION: Extract exact monetary amounts, preserving all decimal places
4. TRANSACTION CLASSIFICATION: Accurately categorize as income (credits/deposits) or expenses (debits/withdrawals)
5. ACCOUNT DETAILS: Extract complete account information including holder name, account number, currency, and statement period
6. BALANCE TRACKING: Identify opening balance, closing balance, and any interim balances

ENHANCED EXTRACTION RULES:
- Income transactions: Salaries, deposits, transfers IN, refunds, interest credits, cashback
- Expense transactions: Withdrawals, purchases, transfers OUT, fees, charges, loan payments, bill payments
- Ignore duplicate entries and summary lines
- Preserve original transaction descriptions without modification
- Handle multi-line transaction descriptions by combining them
- Extract reference numbers when available

STRICT JSON OUTPUT FORMAT:
{{
  "account_details": {{
    "name": "Complete account holder name",
    "account_number": "Full account number",
    "currency": "Primary currency (e.g., LKR, USD, EUR)",
    "statement_date": "Complete statement period"
  }},
  "final_balance": 0.00,
  "transactions": {{
    "income": [
      {{
        "date": "DDMMMYYYY format (e.g., 15JUN2024)",
        "description": "Complete transaction description",
        "amount": 0.00,
        "reference": "Transaction reference if available"
      }}
    ],
    "expenses": [
      {{
        "date": "DDMMMYYYY format (e.g., 15JUN2024)", 
        "description": "Complete transaction description",
        "amount": 0.00,
        "reference": "Transaction reference if available"
      }}
    ]
  }}
}}

QUALITY ASSURANCE:
- Verify all amounts are positive numbers
- Ensure dates are in consistent DDMMMYYYY format
- Check that income and expense classifications are accurate
- Confirm no transactions are missed or duplicated

Bank Statement Content:
{processed_text}

IMPORTANT: Return ONLY the JSON response. No additional text, explanations, or formatting."""
        }]
    }
    
    # Configure timeout
    timeout = httpx.Timeout(connect=30.0, read=90.0, write=30.0, pool=30.0)
    
    try:
        logger.info(f"Making API request to Anthropic with processed text length: {len(processed_text)} characters")
        
        # Use retry mechanism
        response = make_api_request_with_retry(headers, data, timeout)
        
        if response is None:
            return {"error": "Failed to get response from API after multiple retries"}
        
        logger.info(f"API response received with status: {response.status_code}")
        
        # Extract usage data for cost calculation
        response_data = response.json()
        
        # Calculate API costs
        cost_data = None
        if "usage" in response_data:
            usage = response_data["usage"]
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            cost_data = calculate_api_cost(input_tokens, output_tokens)
            logger.info(f"API Usage - Input: {input_tokens} tokens, Output: {output_tokens} tokens, Cost: ${cost_data['total_cost_usd']}")
        
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
        error_data = response.json() if response.content else {}
        error_type = error_data.get("error", {}).get("type", "unknown_error")
        error_message = error_data.get("error", {}).get("message", "Unknown error occurred")
        
        if response.status_code == 529:
            return {
                "error": f"Claude AI service is temporarily overloaded. Please try again in a few minutes. (Error: {error_message})",
                "error_type": "service_overloaded",
                "retry_after": 60  # Suggest retrying after 60 seconds
            }
        elif response.status_code == 429:
            return {
                "error": f"Rate limit exceeded. Please wait a moment before trying again. (Error: {error_message})",
                "error_type": "rate_limited",
                "retry_after": 30
            }
        elif response.status_code == 401:
            return {
                "error": "API authentication failed. Please check the API key configuration.",
                "error_type": "authentication_error"
            }
        elif response.status_code == 400:
            return {
                "error": f"Invalid request format. (Error: {error_message})",
                "error_type": "bad_request"
            }
        else:
            return {
                "error": f"AI service error (Status {response.status_code}): {error_message}",
                "error_type": "api_error",
                "status_code": response.status_code
            }
    
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
            
            # Add cost data to the response
            if cost_data:
                parsed_json["api_cost"] = cost_data
            
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
            
            # Add cost data to the response
            if cost_data:
                parsed_json["api_cost"] = cost_data
            
            return parsed_json
        
        # If no code block, try to find JSON-like content
        json_pattern = r'\{.*\}'
        json_match = re.search(json_pattern, raw_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0).strip()
            logger.info(f"Extracted JSON pattern: {json_text[:200]}...")
            parsed_json = json.loads(json_text)
            logger.info("Successfully parsed JSON from pattern match")
            
            # Add cost data to the response
            if cost_data:
                parsed_json["api_cost"] = cost_data
            
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
    total_cost = 0
    total_input_tokens = 0
    total_output_tokens = 0
    
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
            
            # Aggregate cost data
            if "api_cost" in result:
                cost = result["api_cost"]
                total_cost += cost.get("total_cost_usd", 0)
                total_input_tokens += cost.get("input_tokens", 0)
                total_output_tokens += cost.get("output_tokens", 0)
    
    # Remove duplicates based on date and amount
    all_income = remove_duplicate_transactions(all_income)
    all_expenses = remove_duplicate_transactions(all_expenses)
    
    # Prepare final result with aggregated costs
    result = {
        "account_details": account_details or {},
        "final_balance": final_balance,
        "transactions": {
            "income": all_income,
            "expenses": all_expenses
        }
    }
    
    # Add aggregated cost data
    if total_cost > 0:
        result["api_cost"] = {
            "input_tokens": total_input_tokens,
            "output_tokens": total_output_tokens,
            "input_cost_usd": round(total_input_tokens * CLAUDE_INPUT_COST_PER_TOKEN, 6),
            "output_cost_usd": round(total_output_tokens * CLAUDE_OUTPUT_COST_PER_TOKEN, 6),
            "total_cost_usd": round(total_cost, 6),
            "chunks_processed": len(chunks),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    return result

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
