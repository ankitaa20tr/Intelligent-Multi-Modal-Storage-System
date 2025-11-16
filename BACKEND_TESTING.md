# Backend Testing Guide

Complete guide for testing the backend API and all file processing capabilities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Starting the Backend](#starting-the-backend)
3. [Testing with cURL](#testing-with-curl)
4. [Testing with Python](#testing-with-python)
5. [Testing Each File Type](#testing-each-file-type)
6. [Testing Search Endpoints](#testing-search-endpoints)
7. [Testing Statistics](#testing-statistics)
8. [Verifying Output Format](#verifying-output-format)
9. [Common Issues](#common-issues)

---

## Prerequisites

1. **Backend is running** on `http://localhost:8000`
2. **Dependencies installed**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. **Test files ready**:
   - Sample images (`.jpg`, `.png`)
   - Sample videos (`.mp4`, `.mov`)
   - Sample PDFs
   - Sample DOC/DOCX files
   - Sample TXT files
   - Sample JSON files

---

## Starting the Backend

### Method 1: Direct Python
```bash
cd backend
python main.py
```

### Method 2: Uvicorn
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Method 3: Script
```bash
./run_backend.sh
```

**Verify backend is running:**
```bash
curl http://localhost:8000/
```

Expected response:
```json
{"status": "ok", "service": "Unified Smart Storage System"}
```

---

## Testing with cURL

### 1. Health Check

```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "Unified Smart Storage System"
}
```

---

### 2. Upload Image

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@examples/cat.png"
```

**Expected Response Structure:**
```json
{
  "status": "success",
  "type": "media",
  "file_type": "image",
  "category": "animals",
  "location_saved": "storage/media/animals/cat.png",
  "filename": "cat.png",
  "index_id": 1,
  "whats_inside": {
    "summary": "Image file (PNG)",
    "details": {
      "file_type": "image",
      "dimensions": "1920x1080",
      "format": "PNG",
      "file_size_bytes": 2621440,
      "file_size_mb": 2.5
    },
    "description": "Category: animals | Format: PNG | Size: 2.5 MB"
  },
  "metadata": { ... }
}
```

**Verify:**
- ✅ Status is "success"
- ✅ Type is "media"
- ✅ File type is "image"
- ✅ Category is meaningful (not "uncategorized")
- ✅ Location saved shows correct path
- ✅ "whats_inside" contains summary, details, and description

---

### 3. Upload Video

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/video.mp4"
```

**Expected Response Structure:**
```json
{
  "status": "success",
  "type": "media",
  "file_type": "video",
  "category": "animals",
  "location_saved": "storage/media/animals/video.mp4",
  "filename": "video.mp4",
  "index_id": 2,
  "whats_inside": {
    "summary": "Video file (mp4)",
    "details": {
      "file_type": "video",
      "format": "mp4",
      "file_size_bytes": 10485760,
      "file_size_mb": 10.0,
      "num_frames": 300,
      "duration_estimate": "N/A"
    },
    "description": "Category: animals | Format: mp4 | Size: 10.0 MB"
  },
  "metadata": { ... }
}
```

**Verify:**
- ✅ Category is meaningful (not "uncategorized")
- ✅ Video metadata includes frame count
- ✅ Location saved is correct

**Note:** If frame extraction fails, category will be based on filename.

---

### 4. Upload PDF

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/document.pdf"
```

**Expected Response Structure:**
```json
{
  "status": "success",
  "type": "document",
  "file_type": "PDF",
  "category": "technical",
  "location_saved": "storage/media/technical/document.pdf",
  "filename": "document.pdf",
  "index_id": 3,
  "whats_inside": {
    "summary": "PDF document with 1500 words",
    "details": {
      "document_type": "PDF",
      "word_count": 1500,
      "character_count": 8500,
      "page_count": 10,
      "file_size_bytes": 1258291,
      "file_size_mb": 1.2,
      "has_text": true,
      "text_length": 8500
    },
    "description": "Category: technical | Pages: 10 | Words: 1500 | Size: 1.2 MB",
    "text_preview": "This is a technical document about...",
    "properties": {
      "title": "Technical Manual",
      "author": "John Doe"
    }
  },
  "metadata": { ... }
}
```

**Verify:**
- ✅ Category is meaningful (technical, business, academic, etc.)
- ✅ Word count and page count are accurate
- ✅ Text preview shows first 500 characters
- ✅ Properties include title/author if available

---

### 5. Upload DOCX

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/document.docx"
```

**Expected Response Structure:**
Similar to PDF, but with:
- `file_type`: "DOCX"
- `document_type`: "DOCX"

**Verify:**
- ✅ Text is extracted correctly
- ✅ Category is meaningful
- ✅ Word count is accurate

---

### 6. Upload TXT

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/document.txt"
```

**Expected Response Structure:**
Similar to PDF, but with:
- `file_type`: "TXT"
- `document_type`: "TXT"
- May include `line_count` in details

---

### 7. Upload JSON

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@examples/sample.json"
```

**Expected Response Structure:**
```json
{
  "status": "success",
  "type": "json",
  "file_type": "JSON data",
  "category": "json_data_single",
  "location_saved": "json_data_single (sql)",
  "filename": "sample.json",
  "index_id": 4,
  "whats_inside": {
    "summary": "JSON single with 5 fields",
    "details": {
      "structure_type": "single",
      "field_count": 5,
      "nesting_depth": 1,
      "is_consistent": true,
      "storage_type": "sql",
      "schema_name": "json_data_single",
      "records_count": 1
    },
    "sample_keys": ["id", "name", "email", "age", "city"],
    "description": "Storage: sql | Schema: json_data_single | Records: 1"
  },
  "schema_decision": { ... },
  "storage_result": { ... }
}
```

**Verify:**
- ✅ Storage type decision (sql/nosql) is correct
- ✅ Schema name is generated
- ✅ Sample keys are shown
- ✅ Records count is accurate

---

### 8. Batch Upload

```bash
curl -X POST "http://localhost:8000/api/upload/batch" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@file1.jpg" \
  -F "files=@file2.pdf" \
  -F "files=@file3.json"
```

**Expected Response:**
```json
{
  "results": [
    { "status": "success", ... },
    { "status": "success", ... },
    { "status": "success", ... }
  ]
}
```

---

## Testing Search Endpoints

### 1. Search Media

```bash
# Search by category
curl "http://localhost:8000/api/search/media?category=animals&limit=10"

# Search with query
curl "http://localhost:8000/api/search/media?query=cat&limit=10"
```

**Expected Response:**
```json
{
  "results": [
    {
      "id": 1,
      "filename": "cat.png",
      "category": "animals",
      "mime_type": "image/png",
      "storage_path": "storage/media/animals/cat.png"
    }
  ]
}
```

---

### 2. Search Documents

```bash
# Search by category
curl "http://localhost:8000/api/search/documents?category=technical&limit=10"

# Search by MIME type
curl "http://localhost:8000/api/search/documents?mime_type=application/pdf&limit=10"

# Search with text query
curl "http://localhost:8000/api/search/documents?query=python&limit=10"
```

**Expected Response:**
```json
{
  "results": [
    {
      "id": 3,
      "filename": "document.pdf",
      "category": "technical",
      "mime_type": "application/pdf",
      "storage_path": "storage/media/technical/document.pdf",
      "text": "This is a technical document..."
    }
  ]
}
```

---

### 3. Search JSON

```bash
# Search by schema
curl "http://localhost:8000/api/search/json?schema=json_data_single&limit=10"
```

**Expected Response:**
```json
{
  "results": [
    {
      "id": 4,
      "filename": "sample.json",
      "schema_name": "json_data_single",
      "storage_type": "sql",
      "storage_location": "json_data_single"
    }
  ]
}
```

---

## Testing Statistics

```bash
curl "http://localhost:8000/api/stats"
```

**Expected Response:**
```json
{
  "media_files": 25,
  "json_files": 10,
  "document_files": 15,
  "categories": 12,
  "schemas": 3,
  "category_list": ["animals", "food", "technical", ...],
  "schema_list": ["json_data_single", "json_data_array", ...]
}
```

**Verify:**
- ✅ All file type counts are accurate
- ✅ Category list includes all categories
- ✅ Schema list includes all schemas

---

## Testing with Python

Create a test script `test_backend.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print("Health Check:", response.json())
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_upload_image():
    """Test image upload"""
    with open("examples/cat.png", "rb") as f:
        files = {"file": ("cat.png", f, "image/png")}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
    
    result = response.json()
    print("\nImage Upload Result:")
    print(f"Status: {result['status']}")
    print(f"Type: {result['type']}")
    print(f"Category: {result['category']}")
    print(f"Location: {result['location_saved']}")
    print(f"What's Inside: {result['whats_inside']['summary']}")
    
    assert result["status"] == "success"
    assert result["category"] != "uncategorized"

def test_upload_pdf():
    """Test PDF upload"""
    with open("path/to/document.pdf", "rb") as f:
        files = {"file": ("document.pdf", f, "application/pdf")}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
    
    result = response.json()
    print("\nPDF Upload Result:")
    print(f"Category: {result['category']}")
    print(f"Word Count: {result['whats_inside']['details']['word_count']}")
    print(f"Text Preview: {result['whats_inside']['text_preview'][:100]}...")
    
    assert result["status"] == "success"
    assert result["category"] != "uncategorized"

def test_search_documents():
    """Test document search"""
    response = requests.get(
        f"{BASE_URL}/api/search/documents",
        params={"category": "technical", "limit": 5}
    )
    results = response.json()["results"]
    print(f"\nFound {len(results)} technical documents")
    for doc in results:
        print(f"  - {doc['filename']} ({doc['category']})")

if __name__ == "__main__":
    test_health_check()
    test_upload_image()
    test_upload_pdf()
    test_search_documents()
    print("\n✅ All tests passed!")
```

Run:
```bash
python test_backend.py
```

---

## Verifying Output Format

For each upload, verify the response contains:

### Required Fields
- ✅ `status`: "success"
- ✅ `type`: "media" | "document" | "json"
- ✅ `file_type`: Specific type (image, video, PDF, etc.)
- ✅ `category`: Meaningful category (not "uncategorized")
- ✅ `location_saved`: Full path or database location
- ✅ `filename`: Original filename
- ✅ `index_id`: Metadata index ID
- ✅ `whats_inside`: Object with:
  - `summary`: Brief description
  - `details`: Detailed information
  - `description`: Human-readable summary
  - `text_preview`: For documents
  - `sample_keys`: For JSON
  - `properties`: For documents with metadata

### Category Verification

**Media Categories:**
- Should be one of: `animals`, `food`, `vehicles`, `nature`, `people`, `sports`, `technology`, `architecture`, `furniture`, `clothing`
- Should NOT be: `uncategorized` (unless file is truly unclassifiable)

**Document Categories:**
- Should be one of: `technical`, `academic`, `business`, `legal`, `medical`, `financial`, `educational`, `literature`, `scientific`, `news`, `document`
- Should NOT be: `uncategorized`

---

## Common Issues

### Issue: "Uncategorized" for videos

**Symptoms:**
- Video uploads successfully but category is "uncategorized"

**Solutions:**
1. Install video processing libraries:
   ```bash
   pip install imageio imageio-ffmpeg opencv-python
   ```
2. Restart backend
3. Check backend logs for frame extraction errors
4. Verify video file is not corrupted

### Issue: "Uncategorized" for documents

**Symptoms:**
- Document uploads but category is "uncategorized"

**Solutions:**
1. Install document processing libraries:
   ```bash
   pip install PyPDF2 pdfplumber python-docx
   ```
2. Verify document has extractable text
3. Check backend logs for extraction errors
4. Try with a different document

### Issue: Missing "whats_inside" field

**Symptoms:**
- Response doesn't include "whats_inside" object

**Solutions:**
1. Ensure you're using the latest backend code
2. Check backend logs for processing errors
3. Verify file was processed successfully

### Issue: Database connection errors

**Symptoms:**
- Errors about PostgreSQL or MongoDB connection

**Solutions:**
1. Verify databases are running
2. Check `.env` configuration
3. Test database connections manually
4. Ensure database credentials are correct

---

## Test Checklist

- [ ] Health check endpoint works
- [ ] Image upload works and shows correct category
- [ ] Video upload works and shows correct category
- [ ] PDF upload works and extracts text
- [ ] DOCX upload works and extracts text
- [ ] TXT upload works
- [ ] JSON upload works and routes to correct storage
- [ ] Batch upload works
- [ ] Media search works
- [ ] Document search works
- [ ] JSON search works
- [ ] Statistics endpoint works
- [ ] All responses include "whats_inside" field
- [ ] Categories are meaningful (not "uncategorized")
- [ ] Location saved is correct
- [ ] Text preview works for documents
- [ ] Sample keys shown for JSON

---

## Performance Testing

### Large Files
```bash
# Test with large video (100MB+)
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@large_video.mp4"

# Test with large PDF (50MB+)
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@large_document.pdf"
```

### Multiple Files
```bash
# Upload 10 files at once
for i in {1..10}; do
  curl -X POST "http://localhost:8000/api/upload" \
    -F "file=@file$i.jpg" &
done
wait
```

---

## Debugging Tips

1. **Check Backend Logs:**
   - Look for processing errors
   - Check categorization results
   - Verify file paths

2. **Test Individual Components:**
   - Test processors directly
   - Test storage operations
   - Test metadata indexing

3. **Verify File Storage:**
   - Check `storage/media/` directory
   - Verify files are in correct category folders
   - Check file permissions

4. **Database Verification:**
   - Query metadata tables directly
   - Check index records
   - Verify search functionality

---

**Last Updated**: [Current Date]

