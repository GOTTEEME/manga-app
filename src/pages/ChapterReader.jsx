import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { getChapterPages } from "../api/mangadex";

export default function ChapterReader({
  mangaTitle,
  chapterNumber,
  chapterTitle = "",
  pages,
  onPrevChapter,
  onNextChapter,
  commentsCount = 0,
}) {
  const { id } = useParams();
  const location = useLocation();
  const stateMangaTitle = location.state?.mangaTitle;

  const [showChrome, setShowChrome] = useState(true);
  const [viewMode, setViewMode] = useState("longstrip"); // longstrip | single
  const [activePage, setActivePage] = useState(0);
  const [internalPages, setInternalPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChapterPanelOpen, setIsChapterPanelOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const scrollContainerRef = useRef(null);
  const imageRefs = useRef([]);
  const effectivePages = Array.isArray(pages) && pages.length > 0 ? pages : internalPages;
  const totalPages = Array.isArray(effectivePages) ? effectivePages.length : 0;

  useEffect(() => {
    setActivePage(0);
  }, [viewMode, totalPages]);

  useEffect(() => {
    if (pages && pages.length > 0) return;
    if (!id) return;

    let cancelled = false;
    async function loadPages() {
      try {
        setLoading(true);
        setError(null);
        const data = await getChapterPages(id);
        if (!cancelled) {
          setInternalPages(data.quality?.dataSaver || data.pagesDataSaver || data.pages || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load chapter pages.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPages();

    return () => {
      cancelled = true;
    };
  }, [id, pages]);

  const handleToggleChrome = () => {
    setShowChrome((prev) => !prev);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const goToPrevImage = () => {
    if (viewMode === "longstrip") return;
    setActivePage((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const goToNextImage = () => {
    if (viewMode === "longstrip") return;
    setActivePage((prev) =>
      totalPages > 0 ? Math.min(prev + 1, totalPages - 1) : 0
    );
  };

  const currentProgress = useMemo(() => {
    if (!totalPages) return 0;
    return ((activePage + 1) / totalPages) * 100;
  }, [activePage, totalPages]);

  const title = mangaTitle || stateMangaTitle || "Chapter Reader";

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <header
        className={`sticky top-0 z-20 bg-gradient-to-b from-black/90 to-black/40 backdrop-blur-sm transition-opacity duration-200 ${showChrome ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
          {/* Left: back button */}
          <div className="flex items-center gap-3 flex-none">
            <button
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 19L8 12L15 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Center: manga title + chapter name/number, stacked & centered */}
          <div className="flex-1 min-w-0 text-center">
            {/* ชื่อเรื่อง */}
            <div className="text-base sm:text-lg font-semibold truncate max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
              {mangaTitle || title}
            </div>

            {/* ชื่อตอน */}
            {chapterTitle && (
              <div className="text-sm sm:text-base text-gray-200 truncate max-w-xs sm:max-w-sm md:max-w-lg mx-auto mt-1">
                {chapterTitle}
              </div>
            )}

            {/* เลขตอน */}
            {chapterNumber != null && (
              <div className="text-xs sm:text-sm text-gray-300 mt-0.5">
                {chapterNumber}
              </div>
            )}
          </div>
          {/* Right: existing controls */}
          <div className="flex items-center gap-3 text-gray-100 flex-none">
            <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-full p-1 text-[10px] sm:text-xs">
              <button
                onClick={() => setViewMode("single")}
                className={`px-2.5 py-1 rounded-full transition-colors ${viewMode === "single"
                  ? "bg-white text-black"
                  : "text-gray-100 hover:bg-white/20"
                  }`}
              >
                Single
              </button>
              <button
                onClick={() => setViewMode("longstrip")}
                className={`px-2.5 py-1 rounded-full transition-colors ${viewMode === "longstrip"
                  ? "bg-white text-black"
                  : "text-gray-100 hover:bg-white/20"
                  }`}
              >
                Longstrip
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Chapter List Button */}
              <button
                onClick={() => setIsChapterPanelOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition-colors"
              >
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 6H19M5 12H19M5 18H14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Comments Button */}
              <button
                onClick={() => setIsCommentsOpen(true)}
                className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-white/5 hover:bg-white/15 transition-colors text-sm sm:text-base"
              >
                <svg
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 10H16M8 14H12M5 7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V13C19 14.1046 18.1046 15 17 15H10L7 18V15H7C5.89543 15 5 14.1046 5 13V7Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="hidden xs:inline">Comments</span>

                <span className="ml-1 text-xs sm:text-sm text-gray-300">
                  {commentsCount}
                </span>
              </button>
            </div>

          </div>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth bg-black"
        onClick={handleToggleChrome}
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {loading && (
            <div className="flex h-[60vh] items-center justify-center text-sm text-gray-300">
              Loading pages...
            </div>
          )}

          {!loading && error && (
            <div className="flex h-[60vh] items-center justify-center text-center text-sm text-red-400 px-4">
              <div>
                <p className="mb-2">{error}</p>
                <p className="text-xs text-gray-400">Try going back and reopening the chapter.</p>
              </div>
            </div>
          )}

          {!loading && !error && !totalPages && (
            <div className="flex h-[60vh] items-center justify-center text-sm text-gray-300">
              No pages to display.
            </div>
          )}

          {totalPages > 0 && viewMode === "longstrip" && (
            <div className="flex flex-col items-center">
              {effectivePages.map((src, index) => (
                <div
                  key={index}
                  className="w-full max-w-3xl mb-2 sm:mb-4 last:mb-0"
                >
                  <img
                    ref={(el) => {
                      imageRefs.current[index] = el;
                    }}
                    src={src}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto rounded-sm sm:rounded-md shadow-sm select-none"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          )}

          {totalPages > 0 && viewMode === "single" && (
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="relative w-full max-w-3xl">
                <img
                  src={effectivePages[activePage]}
                  alt={`Page ${activePage + 1}`}
                  className="w-full h-auto rounded-sm sm:rounded-md shadow-sm select-none"
                  loading="eager"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 19L8 12L15 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 5L16 12L9 19"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isChapterPanelOpen && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <button
            type="button"
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsChapterPanelOpen(false)}
          />
          <div className="w-72 sm:w-80 h-full bg-black/95 border-l border-white/10 shadow-xl transform translate-x-0 transition-transform duration-200 ease-out flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
              <div className="text-sm font-semibold truncate">
                Chapter options
              </div>
              <button
                type="button"
                onClick={() => setIsChapterPanelOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-gray-200 space-y-3">
              <p className="text-xs text-gray-400">
                Use these actions to navigate chapters. You can expand this panel later to show a full chapter list.
              </p>

              <button
                type="button"
                onClick={() => {
                  if (onNextChapter) {
                    onNextChapter();
                  }
                }}
                disabled={!onNextChapter}
                className="w-full mt-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-left flex items-center justify-between gap-2 transition-colors"
              >
                <span>Next chapter</span>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5L16 12L9 19"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {isCommentsOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCommentsOpen(false)}
          />
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-zinc-900 text-white shadow-2xl border border-white/10 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-white/10">
              <div>
                <h2 className="text-sm sm:text-base font-semibold">Comments</h2>
                <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5">
                  {commentsCount} {commentsCount === 1 ? "person has" : "people have"} commented
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs sm:text-[13px] text-gray-200">Sort by</span>
              <select
                className="ml-auto h-8 rounded-full bg-black/40 border border-white/20 text-xs sm:text-[13px] px-3 text-gray-100 focus:outline-none focus:ring-1 focus:ring-white/40"
                defaultValue="newest"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="top">Top rated</option>
              </select>
            </div>

            <div className="px-4 sm:px-5 py-4 max-h-72 overflow-y-auto text-xs sm:text-sm text-gray-300">
              <p className="text-center text-gray-400">
                No comments loaded in this demo. Hook this modal up to your comments API to display real discussions.
              </p>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`sticky bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-200 ${showChrome ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="w-full px-4 sm:px-6 pt-3 pb-4 sm:pb-5">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrevChapter}
                  disabled={!onPrevChapter}
                  className="px-3.5 sm:px-4 py-2 rounded-full text-sm sm:text-base bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={onNextChapter}
                  disabled={!onNextChapter}
                  className="px-3.5 sm:px-4 py-2 rounded-full text-sm sm:text-base bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${currentProgress || 0}%` }}
                  />
                </div>
                {totalPages > 0 && (
                  <div className="mt-1.5 text-xs sm:text-sm text-gray-300 text-center">
                    Page {activePage + 1} of {totalPages}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 sm:hidden">
                <button
                  onClick={() => setViewMode("single")}
                  className={`px-2 py-1 rounded-full text-[10px] border border-white/15 ${viewMode === "single" ? "bg-white text-black" : "bg-white/5"
                    }`}
                >
                  S
                </button>
                <button
                  onClick={() => setViewMode("longstrip")}
                  className={`px-2 py-1 rounded-full text-[10px] border border-white/15 ${viewMode === "longstrip" ? "bg-white text-black" : "bg-white/5"
                    }`}
                >
                  L
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}