'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import SearchInterface from '@/components/SearchInterface';
import StatsDashboard from '@/components/StatsDashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'stats'>('upload');

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Unified Smart Storage System
          </h1>
          <p className="text-gray-400">
            Intelligently store and retrieve media files and JSON data
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Statistics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'upload' && <FileUpload />}
          {activeTab === 'search' && <SearchInterface />}
          {activeTab === 'stats' && <StatsDashboard />}
        </div>
      </div>
    </main>
  );
}
