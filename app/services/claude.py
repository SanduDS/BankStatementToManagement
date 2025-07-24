import httpx, os
import json
import re
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

def extract_transactions(text):
    headers = {
        "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    data = {
        "model": "claude-3-5-haiku-20241022",
        "max_tokens": 2048,
        "temperature": 0,
        "messages": [{
            "role": "user",
            "content": f"""Extract and categorize this bank statement into structured JSON format. Return ONLY valid JSON without any markdown formatting or explanation text. Include all transactions with date, description, amount, and balance. Categorize into income and expenses:

{text[:15000]}

Return only the JSON object, no other text."""
        }]
    }
    
    # Configure timeout (30 seconds for connect, 60 seconds for read)
    timeout = httpx.Timeout(connect=30.0, read=60.0, write=30.0, pool=30.0)
    
    try:
        logger.info(f"Making API request to Anthropic with text length: {len(text)} characters")
        logger.info(f"Truncated to: {len(text[:10000])} characters for API call")
        
        with httpx.Client(timeout=timeout) as client:
            response = client.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
        
        logger.info(f"API response received with status: {response.status_code}")
        
    except httpx.TimeoutException as e:
        logger.error(f"API request timed out: {e}")
        return {"error": f"API request timed out after 60 seconds: {str(e)}"}
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
