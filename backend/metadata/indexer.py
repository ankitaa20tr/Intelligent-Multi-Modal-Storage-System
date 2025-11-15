"""
Metadata + Indexing Layer
Fast lookup for all stored files/records
Enables efficient retrieval
"""
import os
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import json

from storage.database.sql_storage import SQLStorage
from storage.database.nosql_storage import NoSQLStorage

logger = logging.getLogger(__name__)


class MetadataIndexer:
    """Indexes and retrieves metadata for all stored content"""
    
    def __init__(self):
        # Use SQL for metadata index (fast lookups)
        self.sql_storage = SQLStorage()
        self.nosql_storage = NoSQLStorage()
        self._ensure_metadata_tables()
    
    def _ensure_metadata_tables(self):
        """Ensure metadata index tables exist"""
        # Media metadata table
        media_schema = {
            "table_name": "media_index",
            "columns": [
                {"name": "id", "type": "SERIAL PRIMARY KEY", "nullable": False},
                {"name": "filename", "type": "VARCHAR(255)", "nullable": False},
                {"name": "mime_type", "type": "VARCHAR(100)", "nullable": False},
                {"name": "category", "type": "VARCHAR(100)", "nullable": False},
                {"name": "storage_path", "type": "TEXT", "nullable": False},
                {"name": "embeddings", "type": "JSONB", "nullable": True},
                {"name": "metadata", "type": "JSONB", "nullable": True},
                {"name": "created_at", "type": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "nullable": False},
            ],
            "indexes": [
                {"field": "category", "type": "BTREE"},
                {"field": "filename", "type": "BTREE"},
            ],
        }
        
        # JSON metadata table
        json_schema = {
            "table_name": "json_index",
            "columns": [
                {"name": "id", "type": "SERIAL PRIMARY KEY", "nullable": False},
                {"name": "filename", "type": "VARCHAR(255)", "nullable": False},
                {"name": "schema_name", "type": "VARCHAR(255)", "nullable": False},
                {"name": "storage_type", "type": "VARCHAR(50)", "nullable": False},
                {"name": "storage_location", "type": "TEXT", "nullable": False},
                {"name": "analysis", "type": "JSONB", "nullable": True},
                {"name": "created_at", "type": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "nullable": False},
            ],
            "indexes": [
                {"field": "schema_name", "type": "BTREE"},
                {"field": "storage_type", "type": "BTREE"},
            ],
        }
        
        # Create tables (async, but called during init)
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        loop.run_until_complete(self.sql_storage.create_table(media_schema))
        loop.run_until_complete(self.sql_storage.create_table(json_schema))
    
    async def index_media(self, metadata: Dict) -> int:
        """Index media file metadata"""
        record = {
            "filename": metadata.get("filename"),
            "mime_type": metadata.get("mime_type"),
            "category": metadata.get("category", "uncategorized"),
            "storage_path": str(metadata.get("storage_path", "")),
            "embeddings": json.dumps(metadata.get("embeddings")) if metadata.get("embeddings") else None,
            "metadata": json.dumps(metadata.get("metadata", {})),
        }
        
        result = await self.sql_storage.insert("media_index", record)
        index_id = result.get("id")
        
        logger.info(f"Indexed media: {metadata.get('filename')} -> index_id: {index_id}")
        return index_id or 0
    
    async def index_json(self, metadata: Dict) -> int:
        """Index JSON file metadata"""
        schema_decision = metadata.get("schema_decision", {})
        storage_result = metadata.get("storage_result", {})
        
        schema = schema_decision.get("schema", {})
        record = {
            "filename": metadata.get("filename"),
            "schema_name": schema.get(
                "schema_name",
                schema.get("collection_name", "unknown")
            ),
            "storage_type": schema_decision.get("storage_type", "unknown"),
            "storage_location": (
                storage_result.get("table_name") or
                storage_result.get("collection_name") or
                "unknown"
            ),
            "analysis": json.dumps(metadata.get("analysis", {})),
        }
        
        result = await self.sql_storage.insert("json_index", record)
        index_id = result.get("id")
        
        logger.info(f"Indexed JSON: {metadata.get('filename')} -> index_id: {index_id}")
        return index_id or 0
    
    async def search_media(
        self, category: Optional[str] = None, query: Optional[str] = None, limit: int = 20
    ) -> List[Dict]:
        """Search media by category or query"""
        filters = {}
        if category:
            filters["category"] = category
        
        results = await self.sql_storage.query("media_index", filters, limit)
        
        # TODO: Implement semantic search using embeddings if query is provided
        # For now, return category-filtered results
        
        return results
    
    async def search_json(
        self, schema: Optional[str] = None, query: Optional[str] = None, limit: int = 20
    ) -> List[Dict]:
        """Search JSON records"""
        filters = {}
        if schema:
            filters["schema_name"] = schema
        
        results = await self.sql_storage.query("json_index", filters, limit)
        
        # TODO: Implement query-based search in actual storage
        
        return results
    
    async def get_stats(self) -> Dict:
        """Get system statistics"""
        # Count media files
        media_count = len(await self.sql_storage.query("media_index", limit=10000))
        
        # Count JSON files
        json_count = len(await self.sql_storage.query("json_index", limit=10000))
        
        # Get categories
        media_records = await self.sql_storage.query("media_index", limit=10000)
        categories = set(r.get("category") for r in media_records if r.get("category"))
        
        # Get schemas
        json_records = await self.sql_storage.query("json_index", limit=10000)
        schemas = set(r.get("schema_name") for r in json_records if r.get("schema_name"))
        
        return {
            "media_files": media_count,
            "json_files": json_count,
            "categories": len(categories),
            "schemas": len(schemas),
            "category_list": sorted(list(categories)),
            "schema_list": sorted(list(schemas)),
        }

