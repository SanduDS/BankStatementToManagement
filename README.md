# 🏦 Enhanced Bank Statement Analyzer & Report Generator

A **production-ready** AI-powered application for analyzing bank statements and generating professional PDF reports with advanced financial insights and CSV export capabilities.

## ✨ **Latest Enhancements** (January 2025)

### 🚀 **Major Upgrades**
- **🤖 Claude 3.5 Sonnet Integration** - More accurate transaction extraction
- **🛡️ Smart Bank Statement Validation** - AI-powered document verification with confidence scoring
- **📊 CSV Export Suite** - 4 different export formats for comprehensive data analysis
- **💡 Advanced Financial Insights** - Automated savings rate, spending analysis, and personalized recommendations
- **🎯 Enhanced Error Handling** - Detailed error messages with actionable suggestions
- **📈 Interactive Analytics Dashboard** - Multiple chart types and detailed breakdowns

### 🔥 **Key Features**

#### 🔍 **AI-Powered Analysis**
- **Claude 3.5 Sonnet** for maximum extraction accuracy
- **Smart document validation** with banking keyword detection
- **Confidence scoring** for analysis reliability
- **Enhanced categorization** into 9 expense categories
- **Multi-format date recognition** (DDMMMYYYY, DD/MM/YYYY, etc.)

#### 📊 **Advanced Analytics**
- **Automated savings rate calculation** with personalized advice
- **Monthly trend analysis** with net amount tracking  
- **Category-wise spending breakdown** with percentage analysis
- **Financial health scoring** based on income-expense ratios
- **Interactive charts** (Bar, Area, Line) with detailed tooltips

#### 📄 **Export & Reporting**
- **4 CSV Export Formats**:
  - 📋 **All Transactions** - Chronological with running balances
  - 📊 **Account Summary** - Complete financial metrics
  - 📈 **Monthly Analysis** - Month-by-month breakdown
  - 🏷️ **Category Analysis** - Expense categorization with percentages
- **Professional PDF Reports** with charts and insights
- **One-click downloads** for all data formats

#### 🛡️ **Security & Validation**
- **Bank statement verification** prevents processing of invalid documents
- **File type validation** beyond MIME type checking
- **50MB file size limit** with progress indication
- **Password-protected PDF support** with enhanced error handling
- **No permanent data storage** - complete privacy protection

## ✨ Features

### 🔍 **AI-Powered Analysis**
- Extracts transactions from PDF bank statements using Claude AI
- Automatic categorization of income and expenses  
- Smart date and amount parsing
- Handles password-protected PDFs

### 📊 **Interactive Web Dashboard**
- Real-time transaction analysis with charts
- Monthly income vs expense visualization
- Expense category breakdown with pie charts
- Responsive design with Tailwind CSS

### 📄 **Professional PDF Reports**
- **Account Summary**: Key metrics and account details
- **Visual Charts**: Monthly trends and category breakdowns
- **Financial Insights**: AI-powered spending analysis and recommendations
- **Transaction Tables**: Detailed income and expense listings
- **Professional Formatting**: Corporate-style layout with charts

### 🛡️ **Security & Privacy**
- Secure API processing
- No permanent data storage
- Local PDF generation
- CORS-enabled for web safety

## 🚀 Quick Start

### 1. Backend Setup (FastAPI + Claude AI)

```bash
# Clone and navigate
git clone https://github.com/SanduDS/BankStatementToManagement.git
cd BankStatementToManagement

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
echo "ANTHROPIC_API_KEY=your_claude_api_key_here" > .env

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📡 **Enhanced API Endpoints**

### 🔍 **Analysis Endpoints**
- `POST /api/upload/` - **Enhanced bank statement upload and analysis**
  - ✅ Smart document validation with confidence scoring
  - ✅ Advanced error handling with detailed suggestions  
  - ✅ CSV export data included in response
  - ✅ Processing metadata and analytics
  
- `GET /api/health` - Health check endpoint

### 📊 **New CSV Export Endpoints**
- `POST /api/export-csv/` - **Multi-format CSV export**
  - `export_type=transactions` - All transactions with running balance
  - `export_type=summary` - Account summary and financial metrics
  - `export_type=monthly` - Monthly breakdown analysis
  - `export_type=categories` - Expense categorization analysis  
  - `export_type=all` - All formats in one response

### 📄 **Report Generation**
- `POST /api/generate-report/` - Generate enhanced PDF reports
- **Response**: Professional PDF with charts, insights, and detailed analysis

### 🔧 **Enhanced API Response Format**

```json
{
  "success": true,
  "extracted": {
    "account_details": { "name": "...", "account_number": "...", "currency": "...", "statement_date": "..." },
    "final_balance": 125000.00,
    "transactions": { "income": [...], "expenses": [...] }
  },
  "csv_exports": {
    "transactions": "Date,Type,Description,Amount,Running_Balance\n...",
    "summary": "Metric,Value\nAccount Holder,John Doe\n...",
    "monthly_summary": "Month,Income,Expenses,Net_Amount\n...",
    "category_summary": "Category,Amount,Transaction_Count,Percentage\n..."
  },
  "metadata": {
    "total_transactions": 63,
    "income_transactions": 14,
    "expense_transactions": 49,
    "processing_time": "Complete",
    "confidence": 0.95
  }
}
```

### 🛡️ **Enhanced Error Handling**

```json
{
  "error": "Document doesn't appear to be a bank statement: insufficient banking terminology",
  "error_type": "invalid_bank_statement",
  "confidence": 0.15,
  "analysis": {
    "matched_keywords": ["statement", "account"],
    "currency_patterns_found": 1,
    "date_patterns_found": 2
  },
  "suggestions": [
    "Ensure this is an official bank statement, not a receipt or invoice",
    "Try downloading the statement again from your bank's website",
    "Contact your bank if you continue to experience issues"
  ]
}
```

### Example API Usage

```python
import requests

# Upload and analyze
with open('bank_statement.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/upload/',
        files={'file': f}
    )
analysis_data = response.json()['extracted']

# Generate PDF report
report_response = requests.post(
    'http://localhost:8000/api/generate-report/',
    json=analysis_data,
    stream=True
)

with open('financial_report.pdf', 'wb') as f:
    f.write(report_response.content)
```

### Prerequisites
- Python 3.13.3 or higher
- Git

### Initial Project Creation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SanduDS/BankStatementToManagement.git
   cd BankStatementToManagement
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```
   
   **Note:** You should see `(MVP)` in your terminal prompt when the virtual environment is activated.

4. **Verify the setup:**
   ```bash
   which python
   python --version
   ```
   
   Expected output:
   - Python executable should point to: `/path/to/your/project/venv/bin/python`
   - Python version: `Python 3.13.3`

### Daily Development Workflow

1. **Navigate to project directory:**
   ```bash
   cd /Users/dhanushkas/Private/MVP
   ```

2. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

3. **Install dependencies (when needed):**
   ```bash
   pip install -r requirements.txt
   ```

4. **Work on your project...**

5. **Deactivate virtual environment when done:**
   ```bash
   deactivate
   ```

### Virtual Environment Troubleshooting

#### Signs that virtual environment is activated:
- Terminal prompt shows `(MVP)` or similar indicator
- `which python` points to `./venv/bin/python`
- You're isolated from system-wide Python packages

#### Common activation issues:
- **Wrong directory**: Make sure you're in the project root directory
- **Command syntax**: Use `source venv/bin/activate` (not just `activate`)
- **Permission issues**: Ensure the activate script has execute permissions

#### If activation fails:
1. Check if virtual environment exists:
   ```bash
   ls -la venv/bin/activate
   ```

2. If it doesn't exist, recreate the virtual environment:
   ```bash
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   ```

## Project Structure

```
BankStatementToManagement/
├── app/                    # Backend FastAPI application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── main.py           # FastAPI app entry point
├── frontend/              # React Vite frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main React app
│   │   └── main.jsx      # React entry point
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── venv/                  # Virtual environment (not tracked in git)
├── .git/                  # Git repository
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## Running the Application

### Backend (FastAPI)
1. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

2. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   Backend will run on: http://localhost:8000

### Frontend (React)
1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

## API Documentation

Once the backend is running, you can access:
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Features

### Backend Features
- PDF bank statement parsing
- Claude AI integration for transaction extraction
- RESTful API with FastAPI
- Comprehensive error handling and logging

### Frontend Features
- Modern React UI with Tailwind CSS
- Drag & drop file upload
- Real-time analysis progress
- Interactive charts and visualizations
- Transaction categorization
- Responsive design for mobile and desktop
- Password-protected PDF support

## Development Guidelines

- Always work within the virtual environment
- Keep dependencies updated in `requirements.txt`
- Follow PEP 8 style guidelines
- Write tests for new features
- Update this README when adding new setup steps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add license information here]

---

**Last Updated:** July 24, 2025
