import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { searchManga } from "../api/mangadex";
import LoadingSpinner from "./LoadingSpinner";

const statusLabel = (status) => {
  const map = { ongoing: "กำลังดำเนิน", completed: "จบแล้ว", hiatus: "หยุดพัก", cancelled: "ยกเลิก" };
  return map[status?.toLowerCase()] ?? status ?? "ไม่ทราบ";
};

const ratingLabel = (rating) => {
  const map = { safe: "ปลอดภัย", suggestive: "แนะนำ", erotica: "18+", pornographic: "18+" };
  return map[rating?.toLowerCase()] ?? rating;
};

const ratingColor = (rating) => {
  const map = { safe: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", suggestive: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" };
  return map[rating?.toLowerCase()] ?? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
};

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    try {
      const h = localStorage.getItem("searchHistory");
      if (h) setSearchHistory(JSON.parse(h));
    } catch {
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setError(null);
      return;
    }
    const t = setTimeout(() => performSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const results = await searchManga(query, { limit: 10 });
      setSearchResults(results);
    } catch (err) {
      setError("ค้นหาไม่สำเร็จ กรุณาลองใหม่");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const newHistory = [searchQuery, ...searchHistory.filter((i) => i !== searchQuery).slice(0, 4)];
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    performSearch(searchQuery);
  };

  const handleResultClick = () => {
    onClose();
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-16 px-4 pb-20">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาการ์ตูน..."
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-xs font-medium">ESC</span>
              </button>
            </div>
          </form>

          {/* Body */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="md" text="กำลังค้นหา..." />
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  ผลการค้นหา ({searchResults.length})
                </p>
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/manga/${result.id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <img
                        src={result.coverUrl}
                        alt={result.title}
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/40x56?text=?"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.author}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {statusLabel(result.status)}
                          </span>
                          {result.contentRating && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ratingColor(result.contentRating)}`}>
                              {ratingLabel(result.contentRating)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : searchQuery ? (
              <div className="text-center py-10">
                <Search className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ไม่พบผลการค้นหา</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">ลองค้นหาด้วยคำอื่น</p>
              </div>
            ) : searchHistory.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    ประวัติการค้นหา
                  </p>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(query)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Clock className="w-3 h-3 opacity-60" />
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <Search className="mx-auto h-10 w-10 text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">พิมพ์ชื่อการ์ตูนที่ต้องการค้นหา</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
