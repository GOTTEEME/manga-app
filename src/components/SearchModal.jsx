import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { searchManga } from "../api/mangadex";
import LoadingSpinner from "./LoadingSpinner";

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error("Error parsing search history:", e);
        setSearchHistory([]);
      }
    }
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setError(null);
      return;
    }

    const delayedSearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (query.trim() === "") return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchManga(query, { limit: 10 });
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [
        searchQuery,
        ...searchHistory.filter((item) => item !== searchQuery).slice(0, 4),
      ];
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      
      // Perform search
      performSearch(searchQuery);
    }
  };

  const handleResultClick = () => {
    onClose();
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const handleHistoryItemClick = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search for comics..."
                  className="w-full py-3 px-4 pr-10 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:bg-white focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Search Results */}
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text="Searching..." />
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Search Results ({searchResults.length})
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        to={`/manga/${result.id}`}
                        onClick={handleResultClick}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <img
                          src={result.coverUrl}
                          alt={result.title}
                          className="w-12 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150x200?text=No+Cover";
                          }}
                        />
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {result.title}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">{result.author}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500">
                              Rating: {result.rating || "N/A"}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                result.status === "Ongoing"
                                  ? "bg-blue-100 text-blue-800"
                                  : result.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {result.status}
                            </span>
                            {result.contentRating && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  result.contentRating === "safe"
                                    ? "bg-green-100 text-green-800"
                                    : result.contentRating === "suggestive"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {result.contentRating}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              /* Search History */
              searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Recent Searches</h3>
                    <button
                      onClick={clearHistory}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryItemClick(query)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}