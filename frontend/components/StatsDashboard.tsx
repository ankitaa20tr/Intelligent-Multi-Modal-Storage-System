'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Stats {
  media_files: number;
  json_files: number;
  document_files?: number;
  categories: number;
  schemas: number;
  category_list: string[];
  schema_list: string[];
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-xl border border-red-500/30 p-8 text-center">
        <p className="text-red-400">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl shadow-xl border border-blue-500/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🖼️</span>
            <h3 className="text-sm font-medium text-gray-300">Media Files</h3>
          </div>
          <p className="text-4xl font-bold text-blue-400">{stats.media_files}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl shadow-xl border border-purple-500/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📋</span>
            <h3 className="text-sm font-medium text-gray-300">JSON Files</h3>
          </div>
          <p className="text-4xl font-bold text-purple-400">{stats.json_files}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl shadow-xl border border-green-500/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📄</span>
            <h3 className="text-sm font-medium text-gray-300">Documents</h3>
          </div>
          <p className="text-4xl font-bold text-green-400">{stats.document_files || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl shadow-xl border border-yellow-500/30 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📂</span>
            <h3 className="text-sm font-medium text-gray-300">Categories</h3>
          </div>
          <p className="text-4xl font-bold text-yellow-400">{stats.categories}</p>
        </div>
      </div>

      {/* Categories List */}
      {stats.category_list.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">📂</span>
            Categories ({stats.category_list.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.category_list.map((category) => (
              <span
                key={category}
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30 hover:bg-green-500/30 transition-colors"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schemas List */}
      {stats.schema_list.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">🗄️</span>
            JSON Schemas ({stats.schema_list.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.schema_list.map((schema) => (
              <span
                key={schema}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
              >
                {schema}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.category_list.length === 0 && stats.schema_list.length === 0 && (
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400">No data stored yet. Upload some files to see statistics.</p>
        </div>
      )}
    </div>
  );
}

