import fitz
import logging

logger = logging.getLogger(__name__)

def pdf_to_text(filepath, password=None):
    """
    Enhanced PDF text extraction with better handling of bank statement formats
    """
    doc = fitz.open(filepath)
    
    # Handle password protection
    if doc.needs_pass:
        if not password:
            raise ValueError("PDF is password protected but no password provided")
        if not doc.authenticate(password):
            raise ValueError("Wrong password provided for PDF")
    
    full_text = ""
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        
        # Extract text using different methods to catch more content
        try:
            # Method 1: Standard text extraction
            text1 = page.get_text()
            
            # Method 2: Text extraction with layout preservation
            text2 = page.get_text("text", sort=True)
            
            # Method 3: Extract text blocks with position info
            blocks = page.get_text("dict")
            block_text = ""
            
            for block in blocks["blocks"]:
                if "lines" in block:
                    for line in block["lines"]:
                        line_text = ""
                        for span in line["spans"]:
                            line_text += span["text"]
                        if line_text.strip():
                            block_text += line_text + "\n"
            
            # Choose the most comprehensive text
            page_text = ""
            if len(text2) > len(text1) and len(text2) > len(block_text):
                page_text = text2
            elif len(block_text) > len(text1):
                page_text = block_text
            else:
                page_text = text1
            
            # Clean up the text
            page_text = clean_extracted_text(page_text)
            
            full_text += f"\n--- PAGE {page_num + 1} ---\n"
            full_text += page_text + "\n"
            
            logger.info(f"Page {page_num + 1}: Extracted {len(page_text)} characters")
            
        except Exception as e:
            logger.error(f"Error extracting text from page {page_num + 1}: {e}")
            # Fallback to basic extraction
            try:
                basic_text = page.get_text()
                full_text += f"\n--- PAGE {page_num + 1} (FALLBACK) ---\n"
                full_text += basic_text + "\n"
            except Exception as e2:
                logger.error(f"Fallback extraction also failed for page {page_num + 1}: {e2}")
    
    doc.close()
    
    logger.info(f"Total extracted text length: {len(full_text)} characters")
    logger.info(f"First 500 characters: {full_text[:500]}")
    
    return full_text

def clean_extracted_text(text):
    """
    Clean and normalize extracted text for better processing
    """
    if not text:
        return ""
    
    # Remove excessive whitespace while preserving structure
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Remove excessive spaces but keep reasonable spacing
        cleaned_line = ' '.join(line.split())
        if cleaned_line.strip():  # Only add non-empty lines
            cleaned_lines.append(cleaned_line)
    
    return '\n'.join(cleaned_lines)
