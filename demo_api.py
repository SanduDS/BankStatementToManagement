#!/usr/bin/env python3
"""
Demo script showing how to use the Bank Statement Analyzer API
for both analysis and PDF report generation
"""

import requests
import json
import os
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:8000/api"  # Local development
# For Choreo deployment, uncomment and update with your actual URL:
# API_BASE_URL = "https://your-app-name-xxxx.choreoapis.dev/api"
OUTPUT_DIR = Path("./demo_output")

def analyze_bank_statement(pdf_path, password=None):
    """
    Upload and analyze a bank statement PDF
    
    Args:
        pdf_path (str): Path to the PDF file
        password (str, optional): Password for protected PDFs
        
    Returns:
        dict: Analysis results
    """
    url = f"{API_BASE_URL}/upload/"
    
    # Prepare files and data
    files = {'file': open(pdf_path, 'rb')}
    data = {}
    if password:
        data['password'] = password
    
    try:
        print(f"📄 Analyzing: {pdf_path}")
        response = requests.post(url, files=files, data=data, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        if 'error' in result:
            print(f"❌ Analysis failed: {result['error']}")
            return None
            
        print("✅ Analysis completed successfully!")
        return result['extracted']
        
    except requests.exceptions.Timeout:
        print("❌ Request timed out (>2 minutes)")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None
    finally:
        files['file'].close()

def generate_pdf_report(analysis_data, output_path=None):
    """
    Generate a PDF report from analysis data
    
    Args:
        analysis_data (dict): Results from bank statement analysis
        output_path (str, optional): Where to save the PDF
        
    Returns:
        str: Path to generated PDF file
    """
    url = f"{API_BASE_URL}/generate-report/"
    
    if output_path is None:
        OUTPUT_DIR.mkdir(exist_ok=True)
        output_path = OUTPUT_DIR / "financial_report.pdf"
    
    try:
        print("📊 Generating PDF report...")
        response = requests.post(
            url, 
            json=analysis_data, 
            timeout=60,
            stream=True
        )
        response.raise_for_status()
        
        # Save the PDF
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"✅ PDF report saved: {output_path}")
        return str(output_path)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ PDF generation failed: {e}")
        return None

def print_analysis_summary(data):
    """Print a summary of the analysis results"""
    if not data:
        return
        
    print("\n" + "="*50)
    print("📋 ANALYSIS SUMMARY")
    print("="*50)
    
    # Account details
    account = data.get('account_details', {})
    print(f"Account Holder: {account.get('name', 'N/A')}")
    print(f"Account Number: {account.get('account_number', 'N/A')}")
    print(f"Currency: {account.get('currency', 'N/A')}")
    print(f"Statement Period: {account.get('statement_date', 'N/A')}")
    
    # Financial summary
    transactions = data.get('transactions', {})
    income_list = transactions.get('income', [])
    expense_list = transactions.get('expenses', [])
    
    total_income = sum(t.get('amount', 0) for t in income_list)
    total_expenses = sum(t.get('amount', 0) for t in expense_list)
    net_amount = total_income - total_expenses
    
    print(f"\n💰 Financial Summary:")
    print(f"  Total Income: {total_income:,.2f}")
    print(f"  Total Expenses: {total_expenses:,.2f}")
    print(f"  Net Amount: {net_amount:,.2f}")
    print(f"  Final Balance: {data.get('final_balance', 0):,.2f}")
    
    print(f"\n📊 Transaction Count:")
    print(f"  Income transactions: {len(income_list)}")
    print(f"  Expense transactions: {len(expense_list)}")
    print(f"  Total transactions: {len(income_list) + len(expense_list)}")

def main():
    """Main demo function"""
    print("🏦 Bank Statement Analyzer Demo")
    print("=" * 40)
    
    # Check if server is running
    try:
        response = requests.get(f"{API_BASE_URL}/../health", timeout=5)
        print("✅ Server is running")
    except:
        print("❌ Server is not running. Please start it with:")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return
    
    # Example with sample data (since we don't have a real PDF)
    print("\n📄 Using sample data for demonstration...")
    
    # Sample analysis data
    sample_data = {
        "account_details": {
            "name": "Demo Account Holder",
            "account_number": "1234567890",
            "currency": "LKR",
            "statement_date": "June 2025"
        },
        "final_balance": 125000.00,
        "transactions": {
            "income": [
                {"date": "01JUN2025", "description": "Salary Credit", "amount": 50000.00},
                {"date": "15JUN2025", "description": "Bonus Payment", "amount": 15000.00},
                {"date": "30JUN2025", "description": "Investment Return", "amount": 5000.00}
            ],
            "expenses": [
                {"date": "02JUN2025", "description": "Utility Bill Payment", "amount": 3500.00},
                {"date": "05JUN2025", "description": "ATM Withdrawal", "amount": 10000.00},
                {"date": "10JUN2025", "description": "Restaurant - Pizza Palace", "amount": 2500.00},
                {"date": "12JUN2025", "description": "Fuel Station Payment", "amount": 4000.00},
                {"date": "15JUN2025", "description": "Insurance Premium", "amount": 8000.00},
                {"date": "20JUN2025", "description": "Supermarket - Food City", "amount": 12000.00},
                {"date": "25JUN2025", "description": "Loan Payment", "amount": 15000.00}
            ]
        }
    }
    
    # Show analysis summary
    print_analysis_summary(sample_data)
    
    # Generate PDF report
    pdf_path = generate_pdf_report(sample_data)
    
    if pdf_path:
        print(f"\n🎉 Demo completed successfully!")
        print(f"📄 PDF Report: {pdf_path}")
        print(f"🌐 Web Interface: http://localhost:5173")
        
        # Try to open the PDF (macOS)
        if os.name == 'posix':
            os.system(f"open '{pdf_path}'")
    else:
        print("\n❌ Demo failed to generate PDF report")

if __name__ == "__main__":
    main()
