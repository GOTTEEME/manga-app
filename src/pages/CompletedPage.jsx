import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { getMangaList } from "../api/mangadex";
import LoadingSpinner from "../components/LoadingSpinner";
import MangaGrid from "../components/MangaGrid";

export default function CompletedPage() {
  const { isThai } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 30;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchPage() {
      try {
        setLoading(true);
        setError("");
        const data = await getMangaList({
          limit: LIMIT,
          offset: (currentPage - 1) * LIMIT,
          order: { updatedAt: "desc" },
          status: ["completed"],
          includes: ["cover_art", "author", "artist"],
          contentRating: ["safe", "suggestive"],
        });
        if (!cancelled) {
          setItems(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            isThai
              ? "โหลดการ์ตูนจบแล้วล้มเหลว"
              : "Failed to load completed manga"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [isThai, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = start + 4;
    if (currentPage <= 3) {
      start = 1;
      end = 5;
    }
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  };

  const changePage = (nextPage) => {
    if (loading) return;
    if (nextPage < 1) return;
    if (typeof document !== "undefined") {
      document.activeElement?.blur();
    }
    setCurrentPage(nextPage);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {isThai ? "การ์ตูนจบแล้ว" : "Completed Manga"}
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="w-full flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <MangaGrid items={items} />
        )}
        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
              currentPage === 1 || loading
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {isThai ? "ก่อนหน้า" : "Previous"}
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => changePage(p)}
              disabled={loading}
              className={`w-10 h-10 rounded-md border text-sm font-semibold transition-colors ${
                p === currentPage
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={loading}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
              loading
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {isThai ? "ถัดไป" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
