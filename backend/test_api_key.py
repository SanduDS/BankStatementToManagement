import httpx
import os
from dotenv import load_dotenv

load_dotenv()

def test_api_key():
    headers = {
        "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 10,
        "messages": [{
            "role": "user",
            "content": "Hello"
        }]
    }
    
    print(f"Testing API key: {os.getenv('ANTHROPIC_API_KEY')[:20]}...")
    
    response = httpx.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_api_key()
