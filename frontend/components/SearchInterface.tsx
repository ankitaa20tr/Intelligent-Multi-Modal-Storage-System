'use client';

import { useState } from 'react';
import axios from 'axios';

interface SearchResult {
  id: number;
  filename: string;
  category?: string;
  mime_type?: string;
  storage_path?: string;
  schema_name?: string;
  storage_type?: string;
  [key: string]: any;
}

export default function SearchInterface() {
  const [searchType, setSearchType] = useState<'media' | 'json' | 'documents'>('media');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Search functions
  const searchMedia = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search/media', {
        params: { category: category || undefined, query: query || undefined, limit: 20 },
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchJSON = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search/json', {
        params: { schema: category || undefined, query: query || undefined, limit: 20 },
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search/documents', {
        params: {
          category: category || undefined,
          mime_type: mimeType || undefined,
          query: query || undefined,
          limit: 20,
        },
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'media') {
      searchMedia();
    } else if (searchType === 'json') {
      searchJSON();
    } else {
      searchDocuments();
    }
  };

  return (
    <div className="space-y-6">

      {/* Search Form */}
      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
        <form onSubmit={handleSearch} className="space-y-4">

          {/* Search Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Search Type</label>
            <div className="flex space-x-6">
              <label className="flex items-center text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  value="media"
                  checked={searchType === 'media'}
                  onChange={(e) => setSearchType(e.target.value as 'media' | 'json' | 'documents')}
                  className="mr-2 accent-blue-500"
                />
                Media
              </label>
              <label className="flex items-center text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  value="json"
                  checked={searchType === 'json'}
                  onChange={(e) => setSearchType(e.target.value as 'media' | 'json' | 'documents')}
                  className="mr-2 accent-blue-500"
                />
                JSON
              </label>
              <label className="flex items-center text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  value="documents"
                  checked={searchType === 'documents'}
                  onChange={(e) => setSearchType(e.target.value as 'media' | 'json' | 'documents')}
                  className="mr-2 accent-blue-500"
                />
                Documents
              </label>
            </div>
          </div>

          {/* Category / Schema */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {searchType === 'media' ? 'Category' : searchType === 'json' ? 'Schema' : 'Category'}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={
                searchType === 'media'
                  ? 'e.g., nature, animals, people'
                  : searchType === 'json'
                  ? 'Schema name'
                  : 'e.g., technical, business, academic'
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
            />
          </div>

          {/* MIME Type (for documents) */}
          {searchType === 'documents' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">MIME Type (optional)</label>
              <select
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="">All types</option>
                <option value="application/pdf">PDF</option>
                <option value="application/msword">DOC</option>
                <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
                <option value="text/plain">TXT</option>
              </select>
            </div>
          )}

          {/* Query */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search query"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">✓</span>
            Results ({results.length})
          </h3>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <p className="font-semibold text-white mb-2">{result.filename}</p>

                {searchType === 'media' && (
                  <div className="mt-2 text-sm text-gray-300 space-y-1">
                    {result.category && (
                      <p className="flex items-center gap-2">
                        <span className="text-green-400">📂</span>
                        Category: <span className="text-green-400 font-medium">{result.category}</span>
                      </p>
                    )}
                    {result.mime_type && (
                      <p className="flex items-center gap-2">
                        <span className="text-blue-400">🏷️</span>
                        Type: <span className="text-blue-400">{result.mime_type}</span>
                      </p>
                    )}
                    {result.storage_path && (
                      <p className="text-xs text-gray-400 font-mono mt-2 bg-gray-800/50 p-2 rounded border border-gray-600">
                        {result.storage_path}
                      </p>
                    )}
                  </div>
                )}

                {searchType === 'json' && (
                  <div className="mt-2 text-sm text-gray-300 space-y-1">
                    {result.schema_name && (
                      <p className="flex items-center gap-2">
                        <span className="text-purple-400">📋</span>
                        Schema: <span className="text-purple-400 font-medium">{result.schema_name}</span>
                      </p>
                    )}
                    {result.storage_type && (
                      <p className="flex items-center gap-2">
                        <span className="text-yellow-400">💾</span>
                        Storage: <span className="text-yellow-400 font-medium">{result.storage_type.toUpperCase()}</span>
                      </p>
                    )}
                  </div>
                )}

                {searchType === 'documents' && (
                  <div className="mt-2 text-sm text-gray-300 space-y-1">
                    {result.category && (
                      <p className="flex items-center gap-2">
                        <span className="text-green-400">📂</span>
                        Category: <span className="text-green-400 font-medium">{result.category}</span>
                      </p>
                    )}
                    {result.mime_type && (
                      <p className="flex items-center gap-2">
                        <span className="text-blue-400">🏷️</span>
                        Type: <span className="text-blue-400">{result.mime_type}</span>
                      </p>
                    )}
                    {result.storage_path && (
                      <p className="text-xs text-gray-400 font-mono mt-2 bg-gray-800/50 p-2 rounded border border-gray-600">
                        {result.storage_path}
                      </p>
                    )}
                    {result.text && (
                      <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">Preview:</p>
                        <p className="text-xs text-gray-300 line-clamp-3">
                          {result.text.substring(0, 200)}...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {results.length === 0 && !loading && (
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400">No results found. Try adjusting your search criteria.</p>
        </div>
      )}

    </div>
  );
}
