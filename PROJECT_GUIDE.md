# Intelligent Multi-Modal Storage System - Complete Project Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Setup Instructions](#setup-instructions)
7. [Backend Testing Guide](#backend-testing-guide)
8. [Frontend Testing Guide](#frontend-testing-guide)
9. [API Documentation](#api-documentation)
10. [Output Format](#output-format)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## 🎯 Project Overview

The **Intelligent Multi-Modal Storage System** is a comprehensive file management solution that intelligently processes, categorizes, and stores various file types including:

- **Images** (JPEG, PNG, GIF)
- **Videos** (MP4, MOV, AVI, MKV, WebM)
- **Documents** (PDF, DOC, DOCX, TXT)
- **JSON Data** (Structured data files)

The system uses AI/ML models to automatically categorize files, extract metadata, generate embeddings, and intelligently route data to appropriate storage systems (SQL or NoSQL) based on structure analysis.

### Key Capabilities

- ✅ **Automatic Categorization**: Uses ResNet50 for images/videos and keyword analysis for documents
- ✅ **Intelligent Storage Routing**: Automatically decides SQL vs NoSQL based on JSON structure
- ✅ **Metadata Extraction**: Extracts comprehensive metadata from all file types
- ✅ **Text Extraction**: Extracts text from PDFs, Word documents, and text files
- ✅ **Search Functionality**: Search across all file types by category, type, or content
- ✅ **Unified Interface**: Single interface for all file types

---

## 🏗️ Architecture

### System Components

```
┌─────────────────┐
│   Frontend       │  Next.js + React + TypeScript
│   (Port 3000)    │
└────────┬─────────┘
         │ HTTP/REST
         │
┌────────▼─────────┐
│   Backend API    │  FastAPI (Port 8000)
│   (main.py)      │
└────────┬─────────┘
         │
    ┌────┴────┬──────────┬──────────────┐
    │         │          │              │
┌───▼───┐ ┌──▼──┐  ┌────▼────┐  ┌─────▼─────┐
│ Media │ │ Doc │  │  JSON   │  │ Metadata  │
│ Proc. │ │Proc.│  │ Analyzer│  │  Indexer  │
└───┬───┘ └──┬──┘  └────┬────┘  └─────┬─────┘
    │        │          │              │
    └────────┴──────────┴──────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐        ┌─────▼─────┐
│  File │        │  Database │
│System │        │  Storage  │
│Storage│        │ (SQL/NoSQL)│
└───────┘        └───────────┘
```

### Data Flow

1. **Upload**: User uploads file via frontend
2. **Detection**: Backend detects file type (MIME type)
3. **Routing**: File routed to appropriate processor
4. **Processing**: 
   - Media: ResNet50 classification + embeddings
   - Documents: Text extraction + categorization
   - JSON: Structure analysis + storage decision
5. **Storage**: File saved to filesystem + metadata indexed
6. **Response**: Enhanced response with type, category, location, and content summary

---

## ✨ Features

### File Type Support

| Type | Formats | Processing | Categorization |
|------|---------|------------|----------------|
| **Images** | JPEG, PNG, GIF | ResNet50 embeddings | ImageNet → Category mapping |
| **Videos** | MP4, MOV, AVI, MKV, WebM | Frame extraction + ResNet50 | ImageNet → Category mapping |
| **PDF** | PDF | Text extraction (PyPDF2/pdfplumber) | Keyword-based categorization |
| **Word** | DOC, DOCX | Text extraction (python-docx) | Keyword-based categorization |
| **Text** | TXT | Direct text reading | Keyword-based categorization |
| **JSON** | JSON | Structure analysis | SQL/NoSQL routing |

### Categorization

**Media Categories:**
- animals, food, vehicles, nature, people, sports, technology, architecture, furniture, clothing

**Document Categories:**
- technical, academic, business, legal, medical, financial, educational, literature, scientific, news

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Python**: 3.11+
- **ML/AI**: 
  - PyTorch 2.9.1
  - torchvision 0.24.1
  - ResNet50 (pre-trained)
- **Document Processing**:
  - PyPDF2 / pdfplumber
  - python-docx
- **Video Processing**:
  - imageio / imageio-ffmpeg
  - opencv-python
- **Database**:
  - PostgreSQL (SQL)
  - MongoDB (NoSQL)
- **Storage**: File system (organized by category)

### Frontend
- **Framework**: Next.js 14.0.3
- **Language**: TypeScript
- **UI**: React 18.2.0 + Tailwind CSS
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
Intelligent-Multi-Modal-Storage-System-main/
│
├── backend/
│   ├── main.py                    # FastAPI application entry point
│   ├── requirements.txt           # Python dependencies
│   │
│   ├── processors/
│   │   ├── media_processor.py    # Image/Video processing (ResNet50)
│   │   ├── document_processor.py  # PDF/DOC/TXT processing
│   │   └── json_analyzer.py       # JSON structure analysis
│   │
│   ├── storage/
│   │   ├── storage_engine.py      # SQL/NoSQL decision engine
│   │   ├── directory_manager.py  # File system organization
│   │   └── database/
│   │       ├── sql_storage.py     # PostgreSQL operations
│   │       └── nosql_storage.py   # MongoDB operations
│   │
│   ├── metadata/
│   │   └── indexer.py             # Metadata indexing & search
│   │
│   ├── monitoring/
│   │   └── logger.py              # Logging configuration
│   │
│   └── storage/
│       └── media/                 # Organized file storage
│           ├── animals/
│           ├── food/
│           ├── technical/
│           └── ...
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Main page
│   │   └── layout.tsx             # App layout
│   │
│   ├── components/
│   │   ├── FileUpload.tsx         # File upload component
│   │   ├── SearchInterface.tsx    # Search component
│   │   └── StatsDashboard.tsx      # Statistics component
│   │
│   ├── package.json               # Node dependencies
│   └── next.config.js             # Next.js configuration
│
├── PROJECT_GUIDE.md              # This file
├── BACKEND_TESTING.md             # Backend testing guide
├── FRONTEND_TESTING.md            # Frontend testing guide
└── README.md                      # Quick start guide
```

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (for SQL storage)
- MongoDB (for NoSQL storage)
- FFmpeg (for video processing - optional but recommended)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (create `.env` file)
   ```env
   # Database Configuration
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=your_user
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=storage_db
   
   MONGODB_URI=mongodb://localhost:27017/
   MONGODB_DB=storage_db
   
   # Storage
   STORAGE_BASE_PATH=storage/media
   ```

5. **Start backend server**
   ```bash
   python main.py
   # Or use uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

### Quick Start Scripts

**Backend:**
```bash
./run_backend.sh
```

**Frontend:**
```bash
./run_frontend.sh
```

---

## 🧪 Backend Testing Guide

See [BACKEND_TESTING.md](./BACKEND_TESTING.md) for detailed backend testing instructions.

### Quick Backend Tests

#### 1. Health Check
```bash
curl http://localhost:8000/
```

Expected response:
```json
{"status": "ok", "service": "Unified Smart Storage System"}
```

#### 2. Upload Image
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/image.jpg"
```

#### 3. Upload Video
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/video.mp4"
```

#### 4. Upload PDF
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/document.pdf"
```

#### 5. Upload JSON
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/data.json"
```

#### 6. Search Media
```bash
curl "http://localhost:8000/api/search/media?category=animals&limit=10"
```

#### 7. Search Documents
```bash
curl "http://localhost:8000/api/search/documents?category=technical&limit=10"
```

#### 8. Get Statistics
```bash
curl "http://localhost:8000/api/stats"
```

---

## 🎨 Frontend Testing Guide

See [FRONTEND_TESTING.md](./FRONTEND_TESTING.md) for detailed frontend testing instructions.

### Quick Frontend Tests

1. **Open Browser**: Navigate to `http://localhost:3000`

2. **Upload Tab**:
   - Upload different file types
   - Verify enhanced output shows:
     - Type
     - Category
     - Location saved
     - What's inside (summary, details, preview)

3. **Search Tab**:
   - Test media search
   - Test document search
   - Test JSON search

4. **Statistics Tab**:
   - Verify file counts
   - Check category lists

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Health Check
```
GET /
```
Response:
```json
{
  "status": "ok",
  "service": "Unified Smart Storage System"
}
```

#### 2. Upload File
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (binary)
```

**Response Format:**
```json
{
  "status": "success",
  "type": "media|document|json",
  "file_type": "image|video|PDF|DOCX|TXT|JSON data",
  "category": "animals|food|technical|business|...",
  "location_saved": "/path/to/stored/file",
  "filename": "original_filename.ext",
  "index_id": 123,
  "whats_inside": {
    "summary": "Brief description",
    "details": {
      "dimensions": "1920x1080",
      "word_count": 1500,
      "page_count": 5,
      "file_size_mb": 2.5,
      ...
    },
    "description": "Category: technical | Pages: 5 | Words: 1500 | Size: 2.5 MB",
    "text_preview": "First 500 characters...",
    "sample_keys": ["key1", "key2", ...],
    "properties": {
      "title": "Document Title",
      "author": "Author Name"
    }
  },
  "metadata": { ... }
}
```

#### 3. Batch Upload
```
POST /api/upload/batch
Content-Type: multipart/form-data
Body: files[] (array of files)
```

#### 4. Search Media
```
GET /api/search/media?category={category}&query={query}&limit={limit}
```

#### 5. Search Documents
```
GET /api/search/documents?category={category}&mime_type={mime_type}&query={query}&limit={limit}
```

#### 6. Search JSON
```
GET /api/search/json?schema={schema}&query={query}&limit={limit}
```

#### 7. Get Statistics
```
GET /api/stats
```

Response:
```json
{
  "media_files": 50,
  "json_files": 20,
  "document_files": 30,
  "categories": 15,
  "schemas": 5,
  "category_list": ["animals", "food", ...],
  "schema_list": ["schema1", "schema2", ...]
}
```

---

## 📊 Output Format

Every successful upload returns an enhanced response with:

### 1. **Type**
- `media` - Images and videos
- `document` - PDF, DOC, DOCX, TXT
- `json` - JSON data files

### 2. **File Type**
- Specific type: `image`, `video`, `PDF`, `DOCX`, `TXT`, `JSON data`

### 3. **Category**
- Media: `animals`, `food`, `vehicles`, `nature`, `people`, `sports`, `technology`, `architecture`
- Documents: `technical`, `academic`, `business`, `legal`, `medical`, `financial`, `educational`, `literature`, `scientific`, `news`

### 4. **Location Saved**
- Full filesystem path where file is stored
- For JSON: Database table/collection name with storage type

### 5. **What's Inside**
- **Summary**: Brief description
- **Details**: 
  - Media: dimensions, format, file size, frame count
  - Documents: word count, page count, character count, file size
  - JSON: field count, structure type, records count
- **Description**: Human-readable summary
- **Text Preview**: First 500 characters (documents)
- **Sample Keys**: First 5 keys (JSON)
- **Properties**: Title, author, subject (documents)

### Example Outputs

**Image Upload:**
```json
{
  "status": "success",
  "type": "media",
  "file_type": "image",
  "category": "animals",
  "location_saved": "storage/media/animals/cat.png",
  "whats_inside": {
    "summary": "Image file (PNG)",
    "details": {
      "dimensions": "1920x1080",
      "format": "PNG",
      "file_size_mb": 2.5
    },
    "description": "Category: animals | Format: PNG | Size: 2.5 MB"
  }
}
```

**PDF Upload:**
```json
{
  "status": "success",
  "type": "document",
  "file_type": "PDF",
  "category": "technical",
  "location_saved": "storage/media/technical/manual.pdf",
  "whats_inside": {
    "summary": "PDF document with 1500 words",
    "details": {
      "word_count": 1500,
      "page_count": 10,
      "file_size_mb": 1.2
    },
    "description": "Category: technical | Pages: 10 | Words: 1500 | Size: 1.2 MB",
    "text_preview": "This is a technical manual..."
  }
}
```

**JSON Upload:**
```json
{
  "status": "success",
  "type": "json",
  "file_type": "JSON data",
  "category": "json_data_single",
  "location_saved": "users (sql)",
  "whats_inside": {
    "summary": "JSON single with 5 fields",
    "details": {
      "field_count": 5,
      "storage_type": "sql",
      "records_count": 1
    },
    "sample_keys": ["id", "name", "email", "age", "city"],
    "description": "Storage: sql | Schema: json_data_single | Records: 1"
  }
}
```

---

## 🔧 Troubleshooting

### Backend Issues

**Issue: "Uncategorized" for videos**
- **Solution**: Install video processing libraries
  ```bash
  pip install imageio imageio-ffmpeg opencv-python
  ```

**Issue: "Uncategorized" for documents**
- **Solution**: Install document processing libraries
  ```bash
  pip install PyPDF2 pdfplumber python-docx
  ```

**Issue: Database connection errors**
- **Solution**: 
  - Verify PostgreSQL/MongoDB are running
  - Check `.env` configuration
  - Test connections manually

**Issue: Import errors**
- **Solution**: 
  - Ensure virtual environment is activated
  - Reinstall requirements: `pip install -r requirements.txt --force-reinstall`

### Frontend Issues

**Issue: Cannot connect to backend**
- **Solution**:
  - Verify backend is running on port 8000
  - Check `next.config.js` proxy configuration
  - Check browser console for CORS errors

**Issue: Upload fails**
- **Solution**:
  - Check file size limits
  - Verify file type is supported
  - Check backend logs for errors

**Issue: Categories not showing**
- **Solution**:
  - Ensure backend processing libraries are installed
  - Check backend logs for categorization errors
  - Verify file has processable content

---

## 💡 Best Practices

### File Organization
- Files are automatically organized by category in `storage/media/{category}/`
- Use meaningful filenames for better categorization fallback

### Performance
- Large files (>100MB) may take longer to process
- Video processing requires frame extraction (can be slow)
- Consider batch uploads for multiple files

### Security
- Validate file types on both frontend and backend
- Implement file size limits
- Sanitize filenames before storage
- Use environment variables for sensitive data

### Categorization
- Categories are automatically assigned but can be manually adjusted
- Filename-based categorization is used as fallback
- Improve categorization by using descriptive filenames

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PyTorch Documentation](https://pytorch.org/docs/)
- [ResNet50 Paper](https://arxiv.org/abs/1512.03385)

---

## 🤝 Contributing

When contributing:
1. Follow code style guidelines
2. Add tests for new features
3. Update documentation
4. Ensure all file types are properly handled

---

## 📝 License

[Add your license information here]

---

## 📧 Support

For issues or questions:
1. Check troubleshooting section
2. Review backend/frontend logs
3. Check API documentation
4. Review testing guides

---

**Last Updated**: [Current Date]
**Version**: 1.0.0

