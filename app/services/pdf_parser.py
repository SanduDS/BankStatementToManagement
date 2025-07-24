import fitz

def pdf_to_text(filepath, password=None):
    doc = fitz.open(filepath)
    if doc.needs_pass and not doc.authenticate(password):
        raise ValueError("Wrong password")
    return "\n".join([page.get_text() for page in doc])
