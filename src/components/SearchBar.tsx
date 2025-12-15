import React, { useEffect, useState, useRef } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
type SearchResult = {
  id: string;
  title: string;
  type: 'user' | 'content' | 'setting';
  url: string;
};
// Mock search results
const mockSearchResults: SearchResult[] = [{
  id: '1',
  title: 'John Smith',
  type: 'user',
  url: '#/users'
}, {
  id: '2',
  title: 'Sarah Johnson',
  type: 'user',
  url: '#/users'
}, {
  id: '3',
  title: 'Homepage Banner',
  type: 'content',
  url: '#/content'
}, {
  id: '4',
  title: 'About Us Page',
  type: 'content',
  url: '#/content'
}, {
  id: '5',
  title: 'Email Notifications',
  type: 'setting',
  url: '#/settings'
}, {
  id: '6',
  title: 'Two-Factor Authentication',
  type: 'setting',
  url: '#/settings'
}, {
  id: '7',
  title: 'Analytics Dashboard',
  type: 'content',
  url: '#/analytics'
}, {
  id: '8',
  title: 'User Registration',
  type: 'setting',
  url: '#/settings'
}, {
  id: '9',
  title: 'Michael Brown',
  type: 'user',
  url: '#/users'
}, {
  id: '10',
  title: 'Summer Promotion',
  type: 'content',
  url: '#/content'
}];
export const SearchBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      const filteredResults = mockSearchResults.filter(result => result.title.toLowerCase().includes(searchTerm.toLowerCase()));
      setResults(filteredResults);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const handleSearchFocus = () => {
    setIsExpanded(true);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };
  const handleResultClick = (result: SearchResult) => {
    alert(`Navigating to: ${result.title} (${result.type})`);
    setIsExpanded(false);
    setSearchTerm('');
    setResults([]);
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            User
          </span>;
      case 'content':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Content
          </span>;
      case 'setting':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            Setting
          </span>;
      default:
        return null;
    }
  };
  return <div className="relative w-full max-w-md" ref={searchRef}>
      <div className={`flex items-center bg-gray-100 rounded-lg transition-all ${isExpanded ? 'w-full' : 'w-48 md:w-64'}`}>
        <div className="flex items-center flex-grow">
          <SearchIcon className="w-5 h-5 text-gray-500 mx-3" />
          <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none py-2 pr-3 w-full text-gray-700 placeholder-gray-500" value={searchTerm} onChange={handleSearchChange} onFocus={handleSearchFocus} />
        </div>
        {searchTerm && <button className="p-2 text-gray-500 hover:text-gray-700" onClick={clearSearch} aria-label="Clear search">
            <XIcon className="w-4 h-4" />
          </button>}
      </div>
      {isExpanded && <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div> : results.length === 0 ? searchTerm ? <div className="p-4 text-center text-gray-500">
                No results found for "{searchTerm}"
              </div> : <div className="p-4 text-gray-500">
                <p className="font-medium mb-2">Quick Searches:</p>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200" onClick={() => setSearchTerm('user')}>
                    Users
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200" onClick={() => setSearchTerm('content')}>
                    Content
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200" onClick={() => setSearchTerm('settings')}>
                    Settings
                  </button>
                </div>
              </div> : <div>
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-700">
                  Found {results.length} results for "{searchTerm}"
                </p>
              </div>
              <div>
                {results.map(result => <button key={result.id} className="w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors" onClick={() => handleResultClick(result)}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {result.title}
                      </span>
                      {getTypeIcon(result.type)}
                    </div>
                  </button>)}
              </div>
            </div>}
        </div>}
    </div>;
};