"""
Bank statement validation utilities for improved accuracy and security
"""
import re
import mimetypes
from typing import Optional, Dict, Any, List, Tuple
import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

class BankStatementValidator:
    """Enhanced validation for bank statement PDFs"""
    
    def __init__(self):
        # Common bank statement keywords to identify valid bank statements
        self.bank_keywords = [
            'bank', 'statement', 'account', 'balance', 'transaction', 'deposit', 
            'withdrawal', 'credit', 'debit', 'transfer', 'cheque', 'check',
            'opening balance', 'closing balance', 'available balance',
            'account number', 'sort code', 'routing number', 'iban',
            'date', 'description', 'amount', 'reference'
        ]
        
        # Currency patterns for different regions
        self.currency_patterns = [
            r'\$\s*[\d,]+\.?\d*',  # USD
            r'€\s*[\d,]+\.?\d*',   # EUR
            r'£\s*[\d,]+\.?\d*',   # GBP
            r'₹\s*[\d,]+\.?\d*',   # INR
            r'LKR\s*[\d,]+\.?\d*', # Sri Lankan Rupee
            r'[\d,]+\.\d{2}\s*(USD|EUR|GBP|INR|LKR)',  # Amount with currency
            r'[\d,]+\.\d{2}',      # General amount pattern
        ]
        
        # Date patterns commonly found in bank statements
        self.date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',    # DD/MM/YYYY or MM/DD/YYYY
            r'\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4}',  # DD MMM YYYY
            r'\d{2}[A-Z]{3}\d{4}',               # DDMMMYYYY
            r'\d{4}-\d{2}-\d{2}',                # YYYY-MM-DD
        ]

    def validate_file_type(self, file_path: str, filename: str) -> Tuple[bool, str]:
        """
        Validate that the uploaded file is actually a PDF
        """
        try:
            # Check MIME type
            mime_type, _ = mimetypes.guess_type(filename)
            if mime_type != 'application/pdf':
                return False, f"File type not supported. Expected PDF, got {mime_type or 'unknown'}"
            
            # Try to open with PyMuPDF to verify it's a valid PDF
            try:
                doc = fitz.open(file_path)
                if len(doc) == 0:
                    return False, "PDF file appears to be empty"
                doc.close()
            except Exception as e:
                return False, f"Invalid PDF file: {str(e)}"
            
            return True, "Valid PDF file"
            
        except Exception as e:
            return False, f"File validation error: {str(e)}"

    def analyze_pdf_content(self, text: str) -> Dict[str, Any]:
        """
        Analyze PDF content to determine if it's likely a bank statement
        """
        if not text or len(text.strip()) < 100:
            return {
                "is_bank_statement": False,
                "confidence": 0.0,
                "reason": "Insufficient text content extracted from PDF",
                "suggestions": ["Ensure PDF is not corrupted", "Check if PDF is text-based (not scanned image)"]
            }
        
        text_lower = text.lower()
        
        # Count bank-related keywords
        keyword_matches = 0
        matched_keywords = []
        for keyword in self.bank_keywords:
            if keyword in text_lower:
                keyword_matches += 1
                matched_keywords.append(keyword)
        
        # Check for currency patterns
        currency_matches = 0
        for pattern in self.currency_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                currency_matches += 1
        
        # Check for date patterns
        date_matches = 0
        for pattern in self.date_patterns:
            if re.search(pattern, text):
                date_matches += 1
        
        # Calculate confidence score
        total_indicators = len(self.bank_keywords) + len(self.currency_patterns) + len(self.date_patterns)
        matches = keyword_matches + min(currency_matches, 5) + min(date_matches, 5)  # Cap to avoid over-weighting
        confidence = min(matches / (total_indicators * 0.3), 1.0)  # Normalize to 0-1
        
        # Determine if it's likely a bank statement
        is_bank_statement = confidence >= 0.3
        
        analysis = {
            "is_bank_statement": is_bank_statement,
            "confidence": round(confidence, 2),
            "matched_keywords": matched_keywords[:10],  # Limit for readability
            "currency_patterns_found": currency_matches,
            "date_patterns_found": date_matches,
            "text_length": len(text)
        }
        
        if not is_bank_statement:
            analysis["reason"] = self._generate_rejection_reason(keyword_matches, currency_matches, date_matches)
            analysis["suggestions"] = self._generate_suggestions(text, keyword_matches, currency_matches, date_matches)
        
        return analysis

    def _generate_rejection_reason(self, keyword_matches: int, currency_matches: int, date_matches: int) -> str:
        """Generate a specific reason why the PDF was rejected"""
        reasons = []
        
        if keyword_matches < 3:
            reasons.append("insufficient banking terminology")
        if currency_matches < 2:
            reasons.append("no clear monetary amounts found")
        if date_matches < 2:
            reasons.append("insufficient date patterns")
        
        if reasons:
            return f"Document doesn't appear to be a bank statement: {', '.join(reasons)}"
        else:
            return "Document content doesn't match typical bank statement patterns"

    def _generate_suggestions(self, text: str, keyword_matches: int, currency_matches: int, date_matches: int) -> List[str]:
        """Generate helpful suggestions for the user"""
        suggestions = []
        
        if len(text) < 500:
            suggestions.append("PDF may be image-based - try OCR or request a text-based statement from your bank")
        
        if keyword_matches < 3:
            suggestions.append("Ensure this is an official bank statement, not a receipt or invoice")
        
        if currency_matches < 2:
            suggestions.append("Statement should contain monetary amounts and currency information")
        
        if date_matches < 2:
            suggestions.append("Statement should contain transaction dates")
        
        if "password" in text.lower() or "protected" in text.lower():
            suggestions.append("If PDF is password protected, ensure you provided the correct password")
        
        # Generic suggestions
        suggestions.extend([
            "Try downloading the statement again from your bank's website",
            "Ensure the statement covers a valid date range with transactions",
            "Contact your bank if you continue to experience issues"
        ])
        
        return suggestions[:5]  # Limit to 5 most relevant suggestions

def validate_bank_statement_pdf(file_path: str, filename: str, extracted_text: str) -> Dict[str, Any]:
    """
    Main validation function to check if uploaded PDF is a valid bank statement
    
    Returns:
        Dict containing validation results and suggestions
    """
    validator = BankStatementValidator()
    
    # Step 1: Validate file type
    is_valid_pdf, pdf_message = validator.validate_file_type(file_path, filename)
    if not is_valid_pdf:
        return {
            "is_valid": False,
            "error": pdf_message,
            "suggestions": ["Please upload a valid PDF file", "Ensure the file is not corrupted"]
        }
    
    # Step 2: Analyze content
    content_analysis = validator.analyze_pdf_content(extracted_text)
    
    if not content_analysis["is_bank_statement"]:
        return {
            "is_valid": False,
            "error": content_analysis.get("reason", "Document doesn't appear to be a bank statement"),
            "confidence": content_analysis["confidence"],
            "analysis": content_analysis,
            "suggestions": content_analysis.get("suggestions", [])
        }
    
    return {
        "is_valid": True,
        "confidence": content_analysis["confidence"],
        "analysis": content_analysis,
        "message": f"Valid bank statement detected (confidence: {content_analysis['confidence']*100:.1f}%)"
    }
