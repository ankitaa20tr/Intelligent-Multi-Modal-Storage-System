"""
Ingestion Gateway - FastAPI application
Routes uploads to appropriate processors based on data type
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
import os
from pathlib import Path

from processors.media_processor import MediaProcessor
from processors.json_analyzer import JSONAnalyzer
from processors.document_processor import DocumentProcessor
from storage.storage_engine import StorageDecisionEngine
from storage.directory_manager import DirectoryManager
from metadata.indexer import MetadataIndexer
from monitoring.logger import setup_logger

app = FastAPI(title="Unified Smart Storage System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
logger = setup_logger()

# Initialize components with error handling
try:
    media_processor = MediaProcessor()
    logger.info("MediaProcessor initialized")
except Exception as e:
    logger.error(f"Failed to initialize MediaProcessor: {e}")
    media_processor = None

try:
    json_analyzer = JSONAnalyzer()
    logger.info("JSONAnalyzer initialized")
except Exception as e:
    logger.error(f"Failed to initialize JSONAnalyzer: {e}")
    json_analyzer = None

try:
    document_processor = DocumentProcessor()
    logger.info("DocumentProcessor initialized")
except Exception as e:
    logger.error(f"Failed to initialize DocumentProcessor: {e}")
    document_processor = None

try:
    storage_engine = StorageDecisionEngine()
    logger.info("StorageDecisionEngine initialized")
except Exception as e:
    logger.error(f"Failed to initialize StorageDecisionEngine: {e}")
    storage_engine = None

try:
    directory_manager = DirectoryManager()
    logger.info("DirectoryManager initialized")
except Exception as e:
    logger.error(f"Failed to initialize DirectoryManager: {e}")
    directory_manager = None

try:
    metadata_indexer = MetadataIndexer()
    logger.info("MetadataIndexer initialized")
except Exception as e:
    logger.error(f"Failed to initialize MetadataIndexer: {e}")
    metadata_indexer = None

# Ensure upload directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def detect_mime_type(file: UploadFile) -> str:
    """Detect MIME type from file"""
    content_type = file.content_type
    if not content_type:
        # Fallback: check file extension
        filename = file.filename or ""
        ext = Path(filename).suffix.lower()
        mime_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".mp4": "video/mp4",
            ".mov": "video/quicktime",
            ".avi": "video/x-msvideo",
            ".mkv": "video/x-matroska",
            ".webm": "video/webm",
            ".json": "application/json",
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt": "text/plain",
        }
        content_type = mime_map.get(ext, "application/octet-stream")
    return content_type


def is_media_type(mime_type: str) -> bool:
    """Check if MIME type is media (image/video)"""
    return mime_type.startswith("image/") or mime_type.startswith("video/")


def is_json_type(mime_type: str) -> bool:
    """Check if MIME type is JSON"""
    return mime_type == "application/json" or mime_type.endswith("+json")


def is_document_type(mime_type: str) -> bool:
    """Check if MIME type is a document (PDF, DOC, DOCX, TXT)"""
    document_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]
    return mime_type in document_types


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Unified Smart Storage System"}


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Unified upload endpoint
    Detects data type and routes to appropriate processor
    """
    try:
        logger.info(f"Received upload: {file.filename}, type: {file.content_type}")
        
        # Detect MIME type
        mime_type = detect_mime_type(file)
        logger.info(f"Detected MIME type: {mime_type}")
        
        # Save uploaded file temporarily
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        result = None
        
        # Route based on data type
        if is_media_type(mime_type):
            if media_processor is None:
                raise HTTPException(
                    status_code=503,
                    detail="Media processor is not available"
                )
            logger.info("Routing to media processor")
            result = await process_media(file_path, mime_type, file.filename)
        
        elif is_json_type(mime_type):
            if json_analyzer is None or storage_engine is None:
                raise HTTPException(
                    status_code=503,
                    detail="JSON processing components are not available"
                )
            logger.info("Routing to JSON analyzer")
            result = await process_json(file_path, file.filename)
        
        elif is_document_type(mime_type):
            if document_processor is None:
                raise HTTPException(
                    status_code=503,
                    detail="Document processor is not available"
                )
            logger.info("Routing to document processor")
            result = await process_document(file_path, mime_type, file.filename)
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {mime_type}"
            )
        
        # Clean up temp file
        file_path.unlink()
        
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Upload error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def process_media(file_path: Path, mime_type: str, filename: str) -> dict:
    """Process media file through media processor"""
    # Generate embeddings and classify
    processing_result = await media_processor.process(file_path, mime_type)
    
    # Get semantic category
    category = processing_result.get("category", "uncategorized")
    
    # Directory manager: create or use existing category directory
    if directory_manager:
        storage_path = await directory_manager.store_media(
            file_path, category, filename
        )
    else:
        # Fallback: use uploads directory
        storage_path = UPLOAD_DIR / filename
        import shutil
        shutil.copy2(file_path, storage_path)
    
    # Store metadata and index
    metadata = {
        "filename": filename,
        "mime_type": mime_type,
        "category": category,
        "storage_path": str(storage_path),
        "embeddings": processing_result.get("embeddings"),
        "metadata": processing_result.get("metadata", {}),
    }
    
    if metadata_indexer:
        index_id = await metadata_indexer.index_media(metadata)
    else:
        index_id = 0
    
    logger.info(f"Media processed: {filename} -> {storage_path}, category: {category}")
    
    # Prepare content summary
    content_summary = {
        "file_type": "image" if mime_type.startswith("image/") else "video",
        "dimensions": f"{metadata.get('metadata', {}).get('width', 'N/A')}x{metadata.get('metadata', {}).get('height', 'N/A')}" if mime_type.startswith("image/") else None,
        "format": metadata.get("metadata", {}).get("format", mime_type.split("/")[-1]),
        "file_size_bytes": metadata.get("metadata", {}).get("file_size", 0),
        "file_size_mb": round(metadata.get("metadata", {}).get("file_size", 0) / (1024 * 1024), 2) if metadata.get("metadata", {}).get("file_size") else 0,
    }
    
    if mime_type.startswith("video/"):
        content_summary.update({
            "num_frames": metadata.get("metadata", {}).get("num_frames", "N/A"),
            "duration_estimate": "N/A",  # Could be calculated if needed
        })
    
    return {
        "status": "success",
        "type": "media",
        "file_type": content_summary["file_type"],
        "category": category,
        "location_saved": str(storage_path),
        "filename": filename,
        "index_id": index_id,
        "whats_inside": {
            "summary": f"{content_summary['file_type'].title()} file ({content_summary['format']})",
            "details": content_summary,
            "description": f"Category: {category} | Format: {content_summary['format']} | Size: {content_summary['file_size_mb']} MB",
        },
        "metadata": metadata,
    }


async def process_json(file_path: Path, filename: str) -> dict:
    """Process JSON file through JSON analyzer"""
    # Analyze JSON structure
    analysis = await json_analyzer.analyze(file_path)
    
    # Schema builder decides SQL vs NoSQL
    schema_decision = await storage_engine.decide_storage(analysis)
    
    # Store in appropriate database
    storage_result = await storage_engine.store_json(
        file_path, analysis, schema_decision
    )
    
    # Store metadata and index
    metadata = {
        "filename": filename,
        "analysis": analysis,
        "schema_decision": schema_decision,
        "storage_result": storage_result,
    }
    
    if metadata_indexer:
        index_id = await metadata_indexer.index_json(metadata)
    else:
        index_id = 0
    
    logger.info(
        f"JSON processed: {filename} -> {schema_decision['storage_type']}, "
        f"schema: {schema_decision.get('schema_name')}"
    )
    
    # Prepare content summary
    structure_type = analysis.get("type", "unknown")
    field_count = analysis.get("field_count", 0)
    nesting_depth = analysis.get("nesting_depth", 0)
    is_consistent = analysis.get("is_consistent", False)
    
    content_summary = {
        "structure_type": structure_type,
        "field_count": field_count,
        "nesting_depth": nesting_depth,
        "is_consistent": is_consistent,
        "storage_type": schema_decision.get("storage_type", "unknown"),
        "schema_name": schema_decision.get("schema", {}).get("schema_name", "N/A"),
        "records_count": storage_result.get("records_inserted", 0),
    }
    
    # Extract sample keys from structure
    structure = analysis.get("structure", {})
    sample_keys = list(structure.get("fields", {}).keys())[:5]  # First 5 keys
    
    return {
        "status": "success",
        "type": "json",
        "file_type": "JSON data",
        "category": schema_decision.get("schema", {}).get("schema_name", "json_data"),
        "location_saved": f"{storage_result.get('table_name') or storage_result.get('collection_name', 'N/A')} ({schema_decision.get('storage_type', 'unknown')})",
        "filename": filename,
        "index_id": index_id,
        "whats_inside": {
            "summary": f"JSON {structure_type} with {field_count} fields",
            "details": content_summary,
            "sample_keys": sample_keys,
            "description": f"Storage: {schema_decision.get('storage_type', 'unknown')} | Schema: {content_summary['schema_name']} | Records: {content_summary['records_count']}",
        },
        "schema_decision": schema_decision,
        "storage_result": storage_result,
    }


async def process_document(file_path: Path, mime_type: str, filename: str) -> dict:
    """Process document file (PDF, DOC, DOCX, TXT) through document processor"""
    # Process document to extract text and metadata
    processing_result = await document_processor.process(file_path, mime_type)
    
    # Get semantic category
    category = processing_result.get("category", "uncategorized")
    
    # Directory manager: create or use existing category directory
    if directory_manager:
        storage_path = await directory_manager.store_media(
            file_path, category, filename
        )
    else:
        # Fallback: use uploads directory
        storage_path = UPLOAD_DIR / filename
        import shutil
        shutil.copy2(file_path, storage_path)
    
    # Store metadata and index
    metadata = {
        "filename": filename,
        "mime_type": mime_type,
        "category": category,
        "storage_path": str(storage_path),
        "text": processing_result.get("text", ""),
        "embeddings": processing_result.get("embeddings"),
        "metadata": processing_result.get("metadata", {}),
    }
    
    if metadata_indexer:
        index_id = await metadata_indexer.index_document(metadata)
    else:
        index_id = 0
    
    logger.info(f"Document processed: {filename} -> {storage_path}, category: {category}")
    
    # Prepare content summary
    doc_metadata = processing_result.get("metadata", {})
    text_content = processing_result.get("text", "")
    word_count = doc_metadata.get("word_count", 0)
    char_count = doc_metadata.get("char_count", 0)
    num_pages = doc_metadata.get("num_pages", doc_metadata.get("line_count", 0))
    
    content_summary = {
        "document_type": mime_type.split("/")[-1].upper(),
        "word_count": word_count,
        "character_count": char_count,
        "page_count": num_pages if num_pages else "N/A",
        "file_size_bytes": doc_metadata.get("file_size", 0),
        "file_size_mb": round(doc_metadata.get("file_size", 0) / (1024 * 1024), 2) if doc_metadata.get("file_size") else 0,
        "has_text": len(text_content) > 0,
        "text_length": len(text_content),
    }
    
    # Extract first few sentences for preview
    text_preview = text_content[:500] if text_content else ""
    if len(text_content) > 500:
        text_preview += "..."
    
    # Get document properties if available
    doc_properties = {}
    if doc_metadata.get("title"):
        doc_properties["title"] = doc_metadata.get("title")
    if doc_metadata.get("author"):
        doc_properties["author"] = doc_metadata.get("author")
    if doc_metadata.get("subject"):
        doc_properties["subject"] = doc_metadata.get("subject")
    
    return {
        "status": "success",
        "type": "document",
        "file_type": content_summary["document_type"],
        "category": category,
        "location_saved": str(storage_path),
        "filename": filename,
        "index_id": index_id,
        "whats_inside": {
            "summary": f"{content_summary['document_type']} document with {word_count} words",
            "details": content_summary,
            "text_preview": text_preview,
            "properties": doc_properties,
            "description": f"Category: {category} | Pages: {content_summary['page_count']} | Words: {word_count} | Size: {content_summary['file_size_mb']} MB",
        },
        "metadata": metadata,
    }


@app.post("/api/upload/batch")
async def upload_batch(files: List[UploadFile] = File(...)):
    """Batch upload endpoint"""
    results = []
    for file in files:
        try:
            result = await upload_file(file)
            results.append(result)
        except Exception as e:
            logger.error(f"Error processing {file.filename}: {str(e)}")
            results.append({
                "status": "error",
                "filename": file.filename,
                "error": str(e),
            })
    return {"results": results}


@app.get("/api/search/media")
async def search_media(
    category: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 20
):
    """Search media by category or semantic query"""
    if metadata_indexer is None:
        raise HTTPException(status_code=503, detail="Metadata indexer is not available")
    results = await metadata_indexer.search_media(
        category=category, query=query, limit=limit
    )
    return {"results": results}


@app.get("/api/search/json")
async def search_json(
    schema: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 20
):
    """Search JSON records"""
    if metadata_indexer is None:
        raise HTTPException(status_code=503, detail="Metadata indexer is not available")
    results = await metadata_indexer.search_json(
        schema=schema, query=query, limit=limit
    )
    return {"results": results}


@app.get("/api/search/documents")
async def search_documents(
    category: Optional[str] = None,
    mime_type: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 20
):
    """Search documents by category, mime type, or text query"""
    if metadata_indexer is None:
        raise HTTPException(status_code=503, detail="Metadata indexer is not available")
    results = await metadata_indexer.search_documents(
        category=category, mime_type=mime_type, query=query, limit=limit
    )
    return {"results": results}


@app.get("/api/stats")
async def get_stats():
    """Get system statistics"""
    if metadata_indexer is None:
        return {"error": "Metadata indexer is not available"}
    stats = await metadata_indexer.get_stats()
    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

