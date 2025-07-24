# Bank Statement to Management System

A Python application for processing and managing bank statements.

## Project Setup

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
├── app/                    # Main application code
├── venv/                   # Virtual environment (not tracked in git)
├── .git/                   # Git repository
├── .gitignore             # Git ignore file
└── README.md              # This file
```

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
