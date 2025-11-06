import { useEffect, useState } from "react";
import { getPopularManga, getRecentlyUpdatedManga } from "../api/mangadex";
import MangaCard from "../components/MangaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useLanguage } from "../contexts/LanguageContext";
import FeaturedCarousel from "../components/FeaturedCarousel";

export default function Home() {
  const { isThai } = useLanguage();
  const [topManga, setTopManga] = useState([]);
  const [latestManga, setLatestManga] = useState([]);
  const [featuredManga, setFeaturedManga] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [error, setError] = useState("");
  const PAGE_SIZE = 30;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function fetchFeatured() {
      try {
        setLoadingFeatured(true);
        const data = await getPopularManga({ limit: 10 });
        if (!cancelled) setFeaturedManga(data);
      } catch (e) {
        if (!cancelled) setError(isThai ? "ไม่สามารถโหลดสไลด์แนะนำได้" : "Failed to load featured slideshow");
      } finally {
        if (!cancelled) setLoadingFeatured(false);
      }
    }
    fetchFeatured();
    async function fetchTop() {
      try {
        setLoadingTop(true);
        const data = await getPopularManga({ limit: 5 });
        if (!cancelled) setTopManga(data);
      } catch (e) {
        if (!cancelled) setError(isThai ? "ไม่สามารถโหลดการ์ตูนยอดนิยมได้" : "Failed to load top manga");
      } finally {
        if (!cancelled) setLoadingTop(false);
      }
    }
    fetchTop();
    return () => {
      cancelled = true;
    };
  }, [isThai]);

  useEffect(() => {
    let cancelled = false;
    async function fetchLatest() {
      try {
        setLoadingLatest(true);
        const data = await getRecentlyUpdatedManga({
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
          order: { updatedAt: "desc" },
        });
        if (!cancelled) setLatestManga(data);
      } catch (e) {
        if (!cancelled) setError(isThai ? "ไม่สามารถโหลดอัปเดตล่าสุดได้" : "Failed to load latest updates");
      } finally {
        if (!cancelled) setLoadingLatest(false);
      }
    }
    fetchLatest();
    return () => {
      cancelled = true;
    };
  }, [isThai, currentPage]);

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
    <div className="bg-gray-50 min-h-screen">
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

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
          {isThai ? "การ์ตูน" : "Manga"}
        </h1>

        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isThai ? "ท็อป 5 การ์ตูน" : "Top 5 Manga"}
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
            <h2 className="text-2xl font-bold text-gray-900">
              {isThai ? "อัปเดตล่าสุด" : "Latest Updates"}
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
                disabled={loadingLatest}
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
              disabled={loadingLatest}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                loadingLatest
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {isThai ? "ถัดไป" : "Next"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
