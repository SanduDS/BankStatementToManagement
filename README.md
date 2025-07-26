# Bank Statement Analyzer & Report Generator

A comprehensive AI-powered application for analyzing bank statements and generating professional PDF reports with financial insights.

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

## 📡 API Endpoints

### Analysis Endpoints
- `POST /api/upload/` - Upload and analyze bank statement PDF
- `GET /api/health` - Health check

### Report Generation
- `POST /api/generate-report/` - Generate PDF report from analysis data
- **Response**: PDF file download

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
