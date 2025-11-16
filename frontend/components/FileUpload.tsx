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
        uploadResults.push({
          status: 'error',
          type: 'unknown',
          filename: file.name,
          error: error.response?.data?.detail || error.message,
        });
      }
    }

    setResults(uploadResults);
    setUploading(false);
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
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
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
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
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag and drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports images, videos, JSON, PDF, DOC, DOCX, and TXT files
          </p>
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-3">Selected Files</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}

      {/* Upload Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-900 mb-3">Upload Results</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  result.status === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{result.filename}</p>
                    {result.status === 'success' && (
                      <div className="mt-2 text-sm text-gray-600 space-y-2">
                        {/* Type and Category */}
                        <div className="flex items-center gap-4">
                          <span className="font-medium">Type:</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {result.file_type || result.type}
                          </span>
                          {result.category && (
                            <>
                              <span className="font-medium">Category:</span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {result.category}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Location Saved */}
                        {(result.location_saved || result.storage_path) && (
                          <div>
                            <span className="font-medium">Location:</span>
                            <p className="text-xs text-gray-500 mt-1 break-all">
                              {result.location_saved || result.storage_path}
                            </p>
                          </div>
                        )}

                        {/* What's Inside */}
                        {result.whats_inside && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-medium text-gray-900 mb-2">What's Inside:</p>
                            
                            {/* Summary */}
                            {result.whats_inside.summary && (
                              <p className="text-sm text-gray-700 mb-2">
                                {result.whats_inside.summary}
                              </p>
                            )}

                            {/* Description */}
                            {result.whats_inside.description && (
                              <p className="text-xs text-gray-600 mb-2">
                                {result.whats_inside.description}
                              </p>
                            )}

                            {/* Details */}
                            {result.whats_inside.details && (
                              <div className="mt-2 space-y-1 text-xs">
                                {result.whats_inside.details.dimensions && (
                                  <p>Dimensions: {result.whats_inside.details.dimensions}</p>
                                )}
                                {result.whats_inside.details.word_count && (
                                  <p>Words: {result.whats_inside.details.word_count.toLocaleString()}</p>
                                )}
                                {result.whats_inside.details.page_count && (
                                  <p>Pages: {result.whats_inside.details.page_count}</p>
                                )}
                                {result.whats_inside.details.file_size_mb && (
                                  <p>Size: {result.whats_inside.details.file_size_mb} MB</p>
                                )}
                                {result.whats_inside.details.field_count !== undefined && (
                                  <p>Fields: {result.whats_inside.details.field_count}</p>
                                )}
                                {result.whats_inside.details.records_count !== undefined && (
                                  <p>Records: {result.whats_inside.details.records_count}</p>
                                )}
                                {result.whats_inside.details.num_frames && (
                                  <p>Frames: {result.whats_inside.details.num_frames}</p>
                                )}
                              </div>
                            )}

                            {/* Sample Keys (for JSON) */}
                            {result.whats_inside.sample_keys && result.whats_inside.sample_keys.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-1">Sample Keys:</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.whats_inside.sample_keys.map((key, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                      {key}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Text Preview (for documents) */}
                            {result.whats_inside.text_preview && (
                              <div className="mt-3 p-2 bg-white rounded border border-gray-300 max-h-32 overflow-y-auto">
                                <p className="text-xs font-medium mb-1 text-gray-700">Text Preview:</p>
                                <p className="text-xs text-gray-600 whitespace-pre-wrap">
                                  {result.whats_inside.text_preview}
                                </p>
                              </div>
                            )}

                            {/* Document Properties */}
                            {result.whats_inside.properties && Object.keys(result.whats_inside.properties).length > 0 && (
                              <div className="mt-2 text-xs">
                                <p className="font-medium mb-1">Properties:</p>
                                {result.whats_inside.properties.title && (
                                  <p>Title: {result.whats_inside.properties.title}</p>
                                )}
                                {result.whats_inside.properties.author && (
                                  <p>Author: {result.whats_inside.properties.author}</p>
                                )}
                                {result.whats_inside.properties.subject && (
                                  <p>Subject: {result.whats_inside.properties.subject}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {result.error && (
                      <p className="mt-2 text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      result.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


