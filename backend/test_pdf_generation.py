#!/usr/bin/env python3

from app.services.pdf_generator import generate_statement_report

# Sample data for testing
sample_data = {
    "account_details": {
        "name": "John Doe",
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

if __name__ == "__main__":
    try:
        print("Generating PDF report...")
        pdf_path = generate_statement_report(sample_data, "/tmp/test_report.pdf")
        print(f"PDF report generated successfully: {pdf_path}")
        print("You can download and view the PDF to see the report format.")
    except Exception as e:
        print(f"Error generating PDF: {e}")
        import traceback
        traceback.print_exc()
