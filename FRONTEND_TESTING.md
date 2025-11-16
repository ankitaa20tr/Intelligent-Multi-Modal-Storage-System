# Frontend Testing Guide

Complete guide for testing the frontend application with enhanced output display showing type, category, location saved, and what's inside for all file types.

## Prerequisites

1. **Backend must be running** on `http://localhost:8000`
2. **Node.js and npm** installed
3. **Test files** ready (videos, PDFs, DOC, DOCX, TXT files)

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Verify Backend Connection

- Open `http://localhost:3000` in your browser
- Check browser console (F12) for any connection errors
- The frontend should automatically proxy API requests to `http://localhost:8000`

## Testing File Uploads

### Test Video Files

1. **Navigate to Upload Tab**
   - Click on the "Upload" tab in the navigation

2. **Upload a Video File**
   - Click "Drag and drop files here, or click to select"
   - Select a video file (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`)
   - The file should appear in the "Selected Files" section

3. **Upload and Verify Enhanced Output**
   - Click "Upload X file(s)" button
   - Wait for processing (may take a few seconds for videos)
   - Check the "Upload Results" section for enhanced output:
     - ✅ **Status**: Should be "success"
     - ✅ **Type Badge**: Should show "video" or "image" in blue badge
     - ✅ **Category Badge**: Should show meaningful category in green badge (not "uncategorized")
     - ✅ **Location**: Should show full path where file is saved
     - ✅ **What's Inside Section**: Should display:
       - Summary (e.g., "Video file (mp4)")
       - Description (e.g., "Category: animals | Format: mp4 | Size: 10.0 MB")
       - Details (dimensions, file size, frame count for videos)
     - Examples of categories: "animals", "food", "vehicles", "nature", "people", "sports", etc.

4. **Expected Categories for Videos:**
   - Videos with animals → "animals"
   - Videos with food → "food"
   - Videos with vehicles → "vehicles"
   - Videos with nature scenes → "nature"
   - Videos with people → "people"
   - Sports videos → "sports"
   - If frame extraction fails, it will use filename-based categorization

### Test PDF Files

1. **Upload a PDF File**
   - Select a PDF file (`.pdf`)
   - Click upload

2. **Verify Enhanced Results**
   - ✅ **Status**: "success"
   - ✅ **Type Badge**: Should show "PDF" in blue badge
   - ✅ **Category Badge**: Should show meaningful category in green badge:
     - Technical PDFs → "technical"
     - Academic papers → "academic"
     - Business documents → "business"
     - Legal documents → "legal"
     - Medical documents → "medical"
     - Financial documents → "financial"
     - Educational content → "educational"
     - Literature → "literature"
     - Scientific papers → "scientific"
     - News articles → "news"
   - ✅ **Location**: Should show full path where PDF is saved
   - ✅ **What's Inside Section**: Should display:
     - Summary (e.g., "PDF document with 1500 words")
     - Description (e.g., "Category: technical | Pages: 10 | Words: 1500 | Size: 1.2 MB")
     - Details (word count, page count, file size)
     - **Text Preview Box**: Should show first 500 characters in scrollable box
     - **Properties**: Should show title, author, subject if available in PDF metadata

### Test DOC/DOCX Files

1. **Upload a Word Document**
   - Select a `.doc` or `.docx` file
   - Click upload

2. **Verify Results**
   - Similar to PDF verification
   - Category should be meaningful
   - Text preview should show extracted content
   - Metadata should include word count, character count

### Test TXT Files

1. **Upload a Text File**
   - Select a `.txt` file
   - Click upload

2. **Verify Results**
   - Category should be meaningful
   - Text preview should show content
   - Metadata should include word count, line count, character count

## Testing Search Functionality

### Test Document Search

1. **Navigate to Search Tab**
   - Click on the "Search" tab

2. **Search Documents**
   - Select "Documents" radio button
   - Optionally enter a category (e.g., "technical", "business")
   - Optionally select a MIME type from dropdown (PDF, DOC, DOCX, TXT)
   - Optionally enter a text query
   - Click "Search"

3. **Verify Results**
   - Results should show matching documents
   - Each result should display:
     - Filename
     - Category
     - MIME type
     - Storage path
     - Text preview (first 200 characters)

### Test Media Search

1. **Search Media Files**
   - Select "Media" radio button
   - Enter a category (e.g., "animals", "food")
   - Click "Search"

2. **Verify Results**
   - Should show matching media files
   - Results include category, MIME type, storage path

### Test JSON Search

1. **Search JSON Files**
   - Select "JSON" radio button
   - Enter a schema name
   - Click "Search"

2. **Verify Results**
   - Should show matching JSON records
   - Results include schema name and storage type

## Testing Statistics Dashboard

1. **Navigate to Statistics Tab**
   - Click on the "Statistics" tab

2. **Verify Statistics**
   - Should show counts for:
     - Media files
     - JSON files
     - Document files (new!)
   - Should show total categories
   - Should list all categories
   - Should list all schemas

## Common Issues and Solutions

### Issue: "Uncategorized" showing for videos

**Solution:**
- Ensure video processing libraries are installed:
  ```bash
  pip install imageio imageio-ffmpeg opencv-python
  ```
- Check backend logs for frame extraction errors
- Videos will fallback to filename-based categorization if frame extraction fails

### Issue: "Uncategorized" showing for documents

**Solution:**
- Ensure document processing libraries are installed:
  ```bash
  pip install PyPDF2 pdfplumber python-docx
  ```
- Check if document has extractable text
- Documents with no text will use filename-based categorization

### Issue: Frontend not connecting to backend

**Solution:**
1. Verify backend is running on port 8000:
   ```bash
   curl http://localhost:8000/
   ```
2. Check `frontend/next.config.js` has correct proxy configuration
3. Check browser console for CORS errors
4. Verify backend CORS settings in `backend/main.py` allow `http://localhost:3000`

### Issue: File upload fails

**Solution:**
1. Check file size limits
2. Check backend logs for errors
3. Verify file type is supported
4. Check browser console for error messages

## Testing Checklist - Enhanced Output Verification

### Upload Functionality
- [ ] Video files upload successfully
- [ ] Videos show meaningful categories (not "uncategorized")
- [ ] Videos display "What's Inside" with frame count and details
- [ ] PDF files upload successfully
- [ ] PDFs show meaningful categories
- [ ] PDFs show "What's Inside" with text preview, word count, page count
- [ ] PDFs show document properties (title, author) if available
- [ ] DOC/DOCX files upload successfully
- [ ] DOC/DOCX show meaningful categories
- [ ] DOC/DOCX show "What's Inside" with text preview
- [ ] TXT files upload successfully
- [ ] TXT files show meaningful categories
- [ ] TXT files show "What's Inside" with text preview
- [ ] JSON files upload successfully
- [ ] JSON files show "What's Inside" with sample keys and storage info

### Output Format Verification
- [ ] All uploads show **Type badge** (blue)
- [ ] All uploads show **Category badge** (green)
- [ ] All uploads show **Location saved** (full path)
- [ ] All uploads show **"What's Inside"** section with:
  - [ ] Summary
  - [ ] Description
  - [ ] Details (file-specific information)
  - [ ] Text preview (for documents)
  - [ ] Sample keys (for JSON)
  - [ ] Properties (for documents with metadata)

### Search Functionality
- [ ] Document search works
- [ ] Media search works
- [ ] JSON search works
- [ ] Search results show correct information

### Statistics
- [ ] Statistics show document counts
- [ ] All file types appear in statistics
- [ ] Categories are listed correctly

### Visual Verification
- [ ] Type and Category badges are clearly visible
- [ ] "What's Inside" section is well-formatted
- [ ] Text preview is scrollable and readable
- [ ] All information is properly displayed

## Sample Test Files

Create test files with these names to verify categorization:

**Videos:**
- `dog_video.mp4` → should categorize as "animals"
- `pizza_cooking.mp4` → should categorize as "food"
- `car_race.mp4` → should categorize as "vehicles"

**Documents:**
- `technical_manual.pdf` → should categorize as "technical"
- `research_paper.pdf` → should categorize as "academic"
- `business_report.docx` → should categorize as "business"
- `legal_contract.pdf` → should categorize as "legal"

## Performance Testing

1. **Upload Multiple Files**
   - Select multiple files of different types
   - Upload all at once
   - Verify all process correctly

2. **Large Files**
   - Test with large PDFs (10+ MB)
   - Test with long videos (1+ minute)
   - Verify processing completes

3. **Search Performance**
   - Search with many documents uploaded
   - Verify search results appear quickly
   - Test with various query combinations

## Browser Compatibility

Test in multiple browsers:
- Chrome/Edge (recommended)
- Firefox
Safari (Mac)

## Debugging Tips

1. **Browser Console (F12)**
   - Check for JavaScript errors
   - Monitor network requests
   - Verify API responses

2. **Backend Logs**
   - Check terminal running backend
   - Look for processing errors
   - Verify categorization logic

3. **Network Tab**
   - Inspect API requests
   - Check response status codes
   - Verify response data structure

## Next Steps

After testing:
1. Report any issues with categorization
2. Verify all file types work as expected
3. Test edge cases (empty files, corrupted files, etc.)
4. Verify search functionality works correctly

