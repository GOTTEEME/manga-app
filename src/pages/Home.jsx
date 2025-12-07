import { useEffect, useState, useMemo } from "react";
import { getMangaByCategory } from "../api/mangadex";
import MangaCard from "../components/MangaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { useCategory } from "../contexts/CategoryContext";
import { getCategoryLabel } from "../utils/category";

export default function Home() {
  const { category } = useCategory();
  const [topManga, setTopManga] = useState([]);
  const [latestManga, setLatestManga] = useState([]);
  const [featuredManga, setFeaturedManga] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [error, setError] = useState("");
  const PAGE_SIZE = 30;
  const [currentPage, setCurrentPage] = useState(1);

  const categoryLabel = useMemo(() => getCategoryLabel(category), [category]);

  useEffect(() => {
    let cancelled = false;
    async function fetchFeatured() {
      try {
        setLoadingFeatured(true);
        const data = await getMangaByCategory(category, { limit: 5, order: { followedCount: "desc" } });
        if (!cancelled) setFeaturedManga(data);
      } catch (e) {
        if (!cancelled) setError("ไม่สามารถโหลดสไลด์แนะนำได้");
      } finally {
        if (!cancelled) setLoadingFeatured(false);
      }
    }
    fetchFeatured();
    async function fetchTop() {
      try {
        setLoadingTop(true);
        const data = await getMangaByCategory(category, { limit: 5, order: { followedCount: "desc" } });
        if (!cancelled) setTopManga(data);
      } catch (e) {
        if (!cancelled) setError("ไม่สามารถโหลดการ์ตูนยอดนิยมได้");
      } finally {
        if (!cancelled) setLoadingTop(false);
      }
    }
    fetchTop();
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    let cancelled = false;
    async function fetchLatest() {
      try {
        setLoadingLatest(true);
        const data = await getMangaByCategory(category, {
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          order: { updatedAt: "desc" },
        });
        if (!cancelled) setLatestManga(data);
      } catch (e) {
        if (!cancelled) setError("ไม่สามารถโหลดอัปเดตล่าสุดได้");
      } finally {
        if (!cancelled) setLoadingLatest(false);
      }
    }
    fetchLatest();
    return () => {
      cancelled = true;
    };
  }, [currentPage, category]);

  const getPageNumbers = () => {
    const pages = [];
    // Show 5-number window centered around current page when possible
    let start = Math.max(1, currentPage - 2);
    let end = start + 4;
    // Ensure start is at least 1
    if (currentPage <= 3) {
      start = 1;
      end = 5;
    }
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  };

  // Smoothly scroll to top when changing pages
  const changePage = (nextPage) => {
    if (loadingLatest) return;
    if (nextPage < 1) return;
    // Blur the focused pagination button to avoid browser keeping it in view
    if (typeof document !== "undefined") {
      document.activeElement?.blur();
    }
    setCurrentPage(nextPage);
  };

  // After the latest list finishes loading, scroll to top smoothly
  useEffect(() => {
    if (!loadingLatest) {
      // wait for paint to avoid layout shift fighting the scroll
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, [loadingLatest]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Slideshow */}
        <section className="mb-10">
          {loadingFeatured ? (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <FeaturedCarousel items={featuredManga} />
          )}
        </section>

        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              มังงะใหม่ยอดฮิต
            </h2>
          </div>
          {loadingTop ? (
            <div className="w-full flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {topManga.map((m) => (
                <MangaCard key={m.id} manga={m} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              อัปเดตล่าสุด ({categoryLabel})
            </h2>
          </div>
          {loadingLatest ? (
            <div className="w-full flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {latestManga.map((m) => (
                <MangaCard key={m.id} manga={m} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1 || loadingLatest}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                currentPage === 1 || loadingLatest
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              ก่อนหน้า
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => changePage(p)}
                disabled={loadingLatest}
                className={`w-10 h-10 rounded-md border text-sm font-semibold transition-colors ${
                  p === currentPage
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={loadingLatest}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                loadingLatest
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              ถัดไป
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
