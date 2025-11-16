'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';

interface UploadResult {
  status: string;
  type: string;
  file_type?: string;
  filename: string;
  category?: string;
  location_saved?: string;
  storage_path?: string;
  schema_decision?: any;
  storage_result?: any;
  index_id?: number;
  error?: string;
  text_preview?: string;
  whats_inside?: {
    summary?: string;
    details?: any;
    description?: string;
    text_preview?: string;
    sample_keys?: string[];
    properties?: any;
  };
  metadata?: any;
}

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setResults([]);

    const uploadResults: UploadResult[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        uploadResults.push(response.data);
      } catch (error: any) {
        // Extract error details
        let errorMessage = 'Unknown error occurred';
        let errorDetail: any = null;
        
        if (error.response?.data) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (typeof error.response.data.detail === 'object') {
            errorDetail = error.response.data.detail;
            errorMessage = errorDetail.message || errorDetail.error || 'Error processing file';
          } else {
            errorMessage = JSON.stringify(error.response.data.detail);
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.error(`Upload error for ${file.name}:`, errorMessage, errorDetail);
        uploadResults.push({
          status: 'error',
          type: 'unknown',
          filename: file.name,
          error: errorDetail || errorMessage,
        });
      }
    }

    setResults(uploadResults);
    setUploading(false);
    setFiles([]);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    if (type.includes('json')) return '📋';
    return '📁';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          onChange={handleFileSelect}
          accept="image/*,video/*,.json,.pdf,.doc,.docx,.txt"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <svg
              className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          </div>
          <p className="text-lg font-medium text-white mb-2">
            Drag and drop files here, or click to select
          </p>
          <p className="text-sm text-gray-400">
            Supports images, videos, JSON, PDF, DOC, DOCX, and TXT files
          </p>
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">📎</span>
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2 mb-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  {getFileIcon(file.type)}
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-blue-500/30"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              `Upload ${files.length} file(s)`
            )}
          </button>
        </div>
      )}

      {/* Upload Results - Section-wise Display */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">✓</span>
            Upload Results ({results.length})
          </h3>
            {results.map((result, index) => (
              <div
                key={index}
              className={`rounded-xl shadow-2xl border overflow-hidden ${
                  result.status === 'success'
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500/30'
                  : 'bg-gradient-to-br from-gray-800 to-gray-900 border-red-500/30'
                }`}
              >
              {/* Header Section */}
              <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getFileIcon(result.type)}</span>
                      <h4 className="text-lg font-bold text-white">{result.filename}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.status === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

                    {result.status === 'success' && (
                <div className="p-6 space-y-4">
                  {/* Type & Category Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-400">🏷️</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">File Type</span>
                      </div>
                      <p className="text-lg font-bold text-blue-400">{result.file_type || result.type}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-400">📂</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</span>
                      </div>
                      <p className="text-lg font-bold text-green-400">{result.category || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Location Section */}
                  {(result.location_saved || result.storage_path) && (
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-purple-400">📍</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Storage Location</span>
                      </div>
                      <p className="text-sm text-gray-300 font-mono break-all bg-gray-800/50 p-2 rounded border border-gray-600">
                        {result.location_saved || result.storage_path}
                      </p>
                    </div>
                  )}

                  {/* What's Inside Section */}
                  {result.whats_inside && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-5 border border-gray-600">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-yellow-400">📦</span>
                        <span className="text-sm font-bold text-white">What's Inside</span>
                      </div>

                      {/* Summary */}
                      {result.whats_inside.summary && (
                        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-sm text-blue-300">{result.whats_inside.summary}</p>
                        </div>
                      )}

                      {/* Description */}
                      {result.whats_inside.description && (
                        <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <p className="text-xs text-purple-300">{result.whats_inside.description}</p>
                        </div>
                      )}

                      {/* Details Grid */}
                      {result.whats_inside.details && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          {result.whats_inside.details.dimensions && (
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">Dimensions</p>
                              <p className="text-sm font-semibold text-white">{result.whats_inside.details.dimensions}</p>
                            </div>
                          )}
                          {result.whats_inside.details.word_count && (
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">Words</p>
                              <p className="text-sm font-semibold text-white">{result.whats_inside.details.word_count.toLocaleString()}</p>
                            </div>
                          )}
                          {result.whats_inside.details.page_count && (
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">Pages</p>
                              <p className="text-sm font-semibold text-white">{result.whats_inside.details.page_count}</p>
                            </div>
                          )}
                          {result.whats_inside.details.file_size_mb && (
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">File Size</p>
                              <p className="text-sm font-semibold text-white">{result.whats_inside.details.file_size_mb} MB</p>
                            </div>
                          )}
                          {result.whats_inside.details.field_count !== undefined && (
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">Fields</p>
                              <p className="text-sm font-semibold text-white">{result.whats_inside.details.field_count}</p>
                            </div>
                          )}
                          {result.whats_inside.details.records_count !== undefined && (
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">Records</p>
                              <p className="text-sm font-semibold text-white">{result.whats_inside.details.records_count}</p>
                            </div>
                          )}
                          {result.whats_inside.details.num_frames && (
                            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">Frames</p>
                              <p className="text-sm font-semibold text-white">{result.whats_inside.details.num_frames}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sample Keys (for JSON) */}
                      {result.whats_inside.sample_keys && result.whats_inside.sample_keys.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Sample Keys</p>
                          <div className="flex flex-wrap gap-2">
                            {result.whats_inside.sample_keys.map((key, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium border border-purple-500/30"
                              >
                                {key}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Schema Display (for JSON) */}
                      {result.schema_decision && (
                        <div className="mb-4 space-y-4">
                          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Database Schema</p>
                          
                          {/* SQL Schema */}
                          {result.schema_decision.storage_type === 'sql' && result.schema_decision.schema && (
                            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-blue-400">🗄️</span>
                                <span className="text-sm font-bold text-blue-400">SQL Schema</span>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">Table:</span>
                                  <span className="text-xs font-mono text-blue-300 font-semibold">{result.schema_decision.schema.table_name || result.schema_decision.schema.schema_name}</span>
                                  {result.schema_decision.schema.primary_key && (
                                    <span className="text-xs text-yellow-400">(PK: {result.schema_decision.schema.primary_key})</span>
                                  )}
                                </div>
                                
                                {/* Main Table Columns */}
                                {result.schema_decision.schema.columns && Array.isArray(result.schema_decision.schema.columns) && (
                                  <div className="mt-3">
                                    <p className="text-xs text-gray-400 mb-2 font-semibold">Columns:</p>
                                    <div className="space-y-1">
                                      {result.schema_decision.schema.columns.map((col: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs bg-gray-800/50 p-2 rounded border border-gray-600">
                                          <span className="font-mono text-blue-300 font-medium">{col.name}</span>
                                          <span className="text-gray-500">→</span>
                                          <span className="text-green-300">{col.type}</span>
                                          {col.primary_key && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-semibold">PK</span>}
                                          {col.is_foreign_key && <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-semibold">FK</span>}
                                          {col.is_reference && <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px] font-semibold">REF</span>}
                                          {col.nullable && !col.primary_key && <span className="text-gray-500 text-[10px]">nullable</span>}
                                          {col.foreign_key && (
                                            <span className="text-xs text-purple-300 ml-1">
                                              → {col.foreign_key.references_table}.{col.foreign_key.references_column}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Nested Tables */}
                                {result.schema_decision.schema.nested_tables && Array.isArray(result.schema_decision.schema.nested_tables) && result.schema_decision.schema.nested_tables.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-xs text-gray-400 mb-2 font-semibold">Related Tables:</p>
                                    {result.schema_decision.schema.nested_tables.map((nested: any, idx: number) => (
                                      <div key={idx} className="mt-2 bg-gray-800/70 rounded-lg p-3 border border-gray-600">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs font-mono text-blue-300 font-semibold">{nested.table_name}</span>
                                          {nested.is_array && <span className="text-xs text-orange-400">[Array]</span>}
                                          <span className="text-xs text-gray-500">← {nested.parent_field}</span>
                                        </div>
                                        {nested.columns && Array.isArray(nested.columns) && (
                                          <div className="space-y-1 mt-2">
                                            {nested.columns.map((col: any, colIdx: number) => (
                                              <div key={colIdx} className="flex items-center gap-2 text-xs bg-gray-900/50 p-1.5 rounded border border-gray-700">
                                                <span className="font-mono text-blue-300">{col.name}</span>
                                                <span className="text-gray-500">→</span>
                                                <span className="text-green-300">{col.type}</span>
                                                {col.foreign_key && (
                                                  <span className="text-xs text-purple-300">
                                                    → {col.foreign_key.references_table}.{col.foreign_key.references_column}
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Relationships */}
                                {result.schema_decision.schema.relationships && Array.isArray(result.schema_decision.schema.relationships) && result.schema_decision.schema.relationships.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-xs text-gray-400 mb-2 font-semibold">Relationships:</p>
                                    <div className="space-y-2">
                                      {result.schema_decision.schema.relationships.map((rel: any, idx: number) => (
                                        <div key={idx} className="bg-purple-500/10 rounded p-2 border border-purple-500/20">
                                          <div className="flex items-center gap-2 text-xs">
                                            <span className="text-purple-400 font-semibold">{rel.type?.replace('-', ' → ').toUpperCase() || 'RELATIONSHIP'}</span>
                                            <span className="text-gray-400">:</span>
                                            <span className="text-blue-300 font-mono">{rel.from_table}.{rel.from_column}</span>
                                            <span className="text-gray-500">→</span>
                                            <span className="text-green-300 font-mono">{rel.to_table}.{rel.to_column}</span>
                                            {rel.field && <span className="text-gray-500 text-[10px]">({rel.field})</span>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* NoSQL Schema */}
                          {result.schema_decision.storage_type === 'nosql' && result.schema_decision.schema && (
                            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-green-400">🍃</span>
                                <span className="text-sm font-bold text-green-400">NoSQL Schema</span>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">Collection:</span>
                                  <span className="text-xs font-mono text-green-300 font-semibold">{result.schema_decision.schema.collection_name || result.schema_decision.schema.schema_name}</span>
                                </div>
                                
                                {/* Field Structure */}
                                {result.schema_decision.schema.field_structure && (
                                  <div className="mt-3">
                                    <p className="text-xs text-gray-400 mb-2 font-semibold">Field Structure:</p>
                                    <div className="space-y-2">
                                      {Object.entries(result.schema_decision.schema.field_structure).map(([fieldName, fieldInfo]: [string, any]) => (
                                        <div key={fieldName} className="bg-gray-800/50 rounded p-2 border border-gray-600">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-green-300 font-medium">{fieldName}</span>
                                            <span className="text-gray-500">→</span>
                                            <span className="text-blue-300 text-xs">{fieldInfo.type}</span>
                                            {fieldInfo.nested && <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px]">NESTED</span>}
                                            {fieldInfo.item_type && <span className="text-xs text-gray-400">[{fieldInfo.item_type}]</span>}
                                          </div>
                                          {fieldInfo.fields && (
                                            <div className="mt-2 ml-4 space-y-1 border-l-2 border-green-500/30 pl-2">
                                              {Object.entries(fieldInfo.fields).map(([nestedName, nestedInfo]: [string, any]) => (
                                                <div key={nestedName} className="text-xs text-gray-300">
                                                  <span className="font-mono">{nestedName}</span>
                                                  <span className="text-gray-500"> : </span>
                                                  <span className="text-blue-300">{nestedInfo.type}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Simple Fields List (fallback) */}
                                {!result.schema_decision.schema.field_structure && result.schema_decision.schema.fields && (
                                  <div className="mt-3">
                                    <p className="text-xs text-gray-400 mb-2">Fields:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {result.schema_decision.schema.fields.map((field: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium border border-green-500/30"
                                        >
                                          {field}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Relationships */}
                                {result.schema_decision.schema.relationships && Array.isArray(result.schema_decision.schema.relationships) && result.schema_decision.schema.relationships.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-xs text-gray-400 mb-2 font-semibold">Embedded Structures:</p>
                                    <div className="space-y-2">
                                      {result.schema_decision.schema.relationships.map((rel: any, idx: number) => (
                                        <div key={idx} className="bg-orange-500/10 rounded p-2 border border-orange-500/20">
                                          <div className="text-xs text-orange-300">
                                            <span className="font-semibold">{rel.type?.replace('_', ' ').toUpperCase() || 'EMBEDDED'}</span>
                                            <span className="text-gray-400"> : </span>
                                            <span className="font-mono">{rel.field}</span>
                                            {rel.structure && <span className="text-gray-500 text-[10px] ml-1">({rel.structure})</span>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Storage Decision Info */}
                          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-yellow-400">💡</span>
                              <span className="text-xs font-semibold text-gray-400">Storage Decision</span>
                            </div>
                            {result.schema_decision.reasoning && (
                              <div className="text-xs text-gray-300 space-y-1">
                                <p>Consistency: <span className="text-yellow-400">{(result.schema_decision.reasoning.consistency * 100).toFixed(0)}%</span></p>
                                <p>Nesting Depth: <span className="text-blue-400">{result.schema_decision.reasoning.nesting_depth}</span></p>
                                <p>Field Count: <span className="text-green-400">{result.schema_decision.reasoning.field_count}</span></p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Text Preview (for documents) */}
                      {result.whats_inside.text_preview && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Text Preview</p>
                          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {result.whats_inside.text_preview}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Document Properties */}
                      {result.whats_inside.properties && Object.keys(result.whats_inside.properties).length > 0 && (
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Document Properties</p>
                          <div className="space-y-2">
                            {result.whats_inside.properties.title && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-16">Title:</span>
                                <span className="text-sm text-white">{result.whats_inside.properties.title}</span>
                              </div>
                            )}
                            {result.whats_inside.properties.author && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-16">Author:</span>
                                <span className="text-sm text-white">{result.whats_inside.properties.author}</span>
                              </div>
                            )}
                            {result.whats_inside.properties.subject && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-16">Subject:</span>
                                <span className="text-sm text-white">{result.whats_inside.properties.subject}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                        )}
                      </div>
                    )}

                    {result.error && (
                <div className="p-6 bg-red-500/10 border-t border-red-500/30">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 text-2xl">⚠️</span>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-bold text-red-400 mb-2">JSON Parsing Error</p>
                        {typeof result.error === 'string' ? (
                          <div className="bg-gray-900/50 p-3 rounded border border-gray-600">
                            <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{result.error}</pre>
                          </div>
                        ) : result.error?.message ? (
                          <>
                            <div className="bg-gray-900/50 p-3 rounded border border-gray-600 mb-2">
                              <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{result.error.message}</pre>
                            </div>
                            {result.error.suggestions && Array.isArray(result.error.suggestions) && result.error.suggestions.length > 0 ? (
                              <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                <p className="text-xs font-semibold text-yellow-400 mb-2">How to Fix:</p>
                                <ul className="space-y-1">
                                  {result.error.suggestions.map((suggestion: string, idx: number) => (
                                    <li key={idx} className="text-xs text-yellow-300 flex items-start gap-2">
                                      <span className="text-yellow-400">•</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : result.error.suggestion ? (
                              <div className="mt-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                <p className="text-xs text-yellow-300">{result.error.suggestion}</p>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div className="bg-gray-900/50 p-3 rounded border border-gray-600">
                            <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{JSON.stringify(result.error, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-xs font-semibold text-blue-400 mb-1">Quick Tips:</p>
                        <ul className="text-xs text-blue-300 space-y-1">
                          <li>• All property names must be in double quotes: <code className="bg-gray-800 px-1 rounded">"name"</code> not <code className="bg-gray-800 px-1 rounded">name</code></li>
                          <li>• Remove trailing commas before closing brackets/braces</li>
                          <li>• Ensure all strings are properly quoted</li>
                          <li>• Check for missing commas between properties</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
