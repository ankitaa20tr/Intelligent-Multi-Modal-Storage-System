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
  const [searchType, setSearchType] = useState<'media' | 'json'>('media');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMedia = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search/media', {
        params: {
          category: category || undefined,
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

  const searchJSON = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search/json', {
        params: {
          schema: category || undefined,
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
    } else {
      searchJSON();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="media"
                  checked={searchType === 'media'}
                  onChange={(e) => setSearchType(e.target.value as 'media')}
                  className="mr-2"
                />
                Media
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={searchType === 'json'}
                  onChange={(e) => setSearchType(e.target.value as 'json')}
                  className="mr-2"
                />
                JSON
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {searchType === 'media' ? 'Category' : 'Schema'}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={
                searchType === 'media'
                  ? 'e.g., nature, animals, people'
                  : 'Schema name'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search query"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            Results ({results.length})
          </h3>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <p className="font-medium text-gray-900">{result.filename}</p>
                {searchType === 'media' && (
                  <div className="mt-2 text-sm text-gray-600">
                    {result.category && <p>Category: {result.category}</p>}
                    {result.mime_type && <p>Type: {result.mime_type}</p>}
                    {result.storage_path && (
                      <p className="text-xs text-gray-500">
                        Path: {result.storage_path}
                      </p>
                    )}
                  </div>
                )}
                {searchType === 'json' && (
                  <div className="mt-2 text-sm text-gray-600">
                    {result.schema_name && (
                      <p>Schema: {result.schema_name}</p>
                    )}
                    {result.storage_type && (
                      <p>Storage: {result.storage_type}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No results found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
}

