import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getChapterPages, getChaptersByMangaId } from "../api/mangadex";

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
  const navigate = useNavigate();
  const stateMangaTitle = location.state?.mangaTitle;
  const stateMangaId = location.state?.mangaId;
  const [resolvedMangaId, setResolvedMangaId] = useState(stateMangaId || null);

  const [showChrome, setShowChrome] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [internalPages, setInternalPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChapterPanelOpen, setIsChapterPanelOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chaptersError, setChaptersError] = useState(null);
  const [chaptersFetchedFor, setChaptersFetchedFor] = useState(null);
  const [navBusy, setNavBusy] = useState(false);

  const scrollContainerRef = useRef(null);
  const imageRefs = useRef({});
  const observerRef = useRef(null);
  const visibilityMapRef = useRef({});
  const suppressClickRef = useRef(false);

  const effectivePages = Array.isArray(pages) && pages.length > 0 ? pages : internalPages;
  const totalPages = Array.isArray(effectivePages) ? effectivePages.length : 0;

  // Title resolved early so hooks below can reference it safely
  const title = mangaTitle || stateMangaTitle || "Chapter Reader";

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || totalPages === 0) return;

    visibilityMapRef.current = {};
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Update visibility ratios per page
        for (const entry of entries) {
          const idxAttr = entry.target.getAttribute('data-page-index');
          if (idxAttr == null) continue;
          const idx = Number(idxAttr);
          visibilityMapRef.current[idx] = entry.intersectionRatio || 0;
        }

        // Find the page with the highest intersection ratio
        let bestIndex = 0;
        let bestRatio = -1;
        for (const [k, v] of Object.entries(visibilityMapRef.current)) {
          const ratio = typeof v === 'number' ? v : 0;
          const i = Number(k);
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = i;
          }
        }

        // Update active page without causing unnecessary renders
        setActivePage((prev) => (prev !== bestIndex ? bestIndex : prev));
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    // Start observing all page images
    observerRef.current = observer;
    Object.values(imageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [totalPages]);

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

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    // Re-observe current image elements
    observer.disconnect();
    visibilityMapRef.current = {};
    Object.values(imageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [effectivePages]);

  // When changing to a new chapter, reset scroll position and active page index
  useEffect(() => {
    const reset = () => {
      const el = scrollContainerRef.current;
      if (el) {
        try { el.scrollTo({ top: 0, behavior: "auto" }); } catch (_) { el.scrollTop = 0; }
      }
      try { window.scrollTo({ top: 0, behavior: "auto" }); } catch (_) { /* noop */ }
    };
    reset();
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => reset());
    }
    const t = setTimeout(() => reset(), 60);
    visibilityMapRef.current = {};
    setActivePage(0);
    // Clear previous chapter pages so UI reflects navigation immediately
    setInternalPages([]);
    setError(null);
    return () => { clearTimeout(t); };
  }, [id]);

  // Resolve mangaId from chapter if not provided (supports direct URL navigation)
  useEffect(() => {
    let cancelled = false;
    async function resolveManga() {
      if (resolvedMangaId || !id) return;
      try {
        const res = await fetch(`/api/chapter/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        const rels = data?.data?.relationships || [];
        const mangaRel = rels.find((r) => r.type === "manga");
        if (!cancelled && mangaRel?.id) {
          setResolvedMangaId(mangaRel.id);
        }
      } catch (_) {
        // ignore resolution errors, user can still read pages
      }
    }
    resolveManga();
    return () => { cancelled = true; };
  }, [id, resolvedMangaId]);

  // Ensure chapters are loaded for navigation even if the chapter panel isn't opened (lightweight)
  useEffect(() => {
    const mangaId = resolvedMangaId;
    if (!mangaId) return;
    if (chaptersFetchedFor === mangaId || chaptersLoading || (chapters && chapters.length > 0)) return;

    let cancelled = false;
    async function loadChaptersForNav() {
      try {
        setChaptersLoading(true);
        setChaptersError(null);
        // Ensure current chapter exists in the list by fetching all languages and all pages once
        const list = await getChaptersByMangaId(mangaId, { fetchAll: true, order: { chapter: "asc" }, translatedLanguage: undefined });

        if (!cancelled) {
          const normalized = (list || []).slice().sort((a, b) => {
            const na = parseFloat(a.chapter);
            const nb = parseFloat(b.chapter);
            const aNum = isNaN(na) ? Infinity : na;
            const bNum = isNaN(nb) ? Infinity : nb;
            if (aNum === bNum) return String(a.chapter).localeCompare(String(b.chapter));
            return aNum - bNum;
          });
          setChapters(normalized);
          setChaptersFetchedFor(mangaId);
        }
      } catch (e) {
        if (!cancelled) {
          setChaptersError(e.message || "Failed to load chapters.");
        }
      } finally {
        if (!cancelled) {
          setChaptersLoading(false);
        }
      }
    }
    loadChaptersForNav();
    return () => { cancelled = true; };
  }, [resolvedMangaId, chaptersFetchedFor, chaptersLoading, chapters]);

  // Current chapter index and navigation availability
  const currentIndex = useMemo(() => {
    if (!chapters || chapters.length === 0) return -1;
    return chapters.findIndex((c) => c.id === id);
  }, [chapters, id]);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < (chapters?.length ?? 0) - 1;

  // Internal fallback navigation if parent didn't pass handlers
  const internalPrevChapter = useCallback(() => {
    if (!canPrev) return;
    const prevId = chapters[currentIndex - 1]?.id;
    if (prevId) {
      const newPath = location.pathname.replace(id, prevId);
      navigate(newPath, { state: { mangaId: resolvedMangaId, mangaTitle: title } });
    }
  }, [canPrev, chapters, currentIndex, location.pathname, id, navigate, resolvedMangaId, title]);

  const internalNextChapter = useCallback(() => {
    if (!canNext) return;
    const nextId = chapters[currentIndex + 1]?.id;
    if (nextId) {
      const newPath = location.pathname.replace(id, nextId);
      navigate(newPath, { state: { mangaId: resolvedMangaId, mangaTitle: title } });
    }
  }, [canNext, chapters, currentIndex, location.pathname, id, navigate, resolvedMangaId, title]);

  const prevHandler = onPrevChapter || (canPrev ? internalPrevChapter : null);
  const nextHandler = onNextChapter || (canNext ? internalNextChapter : null);

  // Load chapters when panel opens the first time for this manga
  useEffect(() => {
    const mangaId = resolvedMangaId;
    if (!isChapterPanelOpen) return;
    if (!mangaId) return;
    if (chaptersFetchedFor === mangaId || chaptersLoading) return;

    let cancelled = false;
    async function loadChapters() {
      try {
        setChaptersLoading(true);
        setChaptersError(null);
        // Fetch ALL languages so the list is complete
        let list = await getChaptersByMangaId(mangaId, { fetchAll: true, order: { chapter: "asc" }, translatedLanguage: undefined });
        if (!cancelled) {
          // Filter out null chapter numbers and sort numerically when possible
          const normalized = (list || []).slice().sort((a, b) => {
            const na = parseFloat(a.chapter);
            const nb = parseFloat(b.chapter);
            const aNum = isNaN(na) ? Infinity : na;
            const bNum = isNaN(nb) ? Infinity : nb;
            if (aNum === bNum) return String(a.chapter).localeCompare(String(b.chapter));
            return aNum - bNum;
          });
          setChapters(normalized);
          setChaptersFetchedFor(mangaId);
        }
      } catch (e) {
        if (!cancelled) {
          setChaptersError(e.message || "Failed to load chapters.");
        }
      } finally {
        if (!cancelled) {
          setChaptersLoading(false);
        }
      }
    }
    loadChapters();
    return () => {
      cancelled = true;
    };
  }, [isChapterPanelOpen, resolvedMangaId, chaptersFetchedFor, chaptersLoading]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const currentProgress = useMemo(() => {
    if (!totalPages) return 0;
    return ((activePage + 1) / totalPages) * 100;
  }, [activePage, totalPages]);

  const safeCall = useCallback(async (fn) => {
    if (!fn || navBusy) return;
    try {
      setNavBusy(true);
      const result = fn();
      if (result && typeof result.then === "function") {
        await result;
      }
    } finally {
      setNavBusy(false);
    }
  }, [navBusy]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      // Avoid interfering with typing
      if (
        target && (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        )
      ) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "j") {
        if (prevHandler && !navBusy && !loading) {
          e.preventDefault();
          safeCall(prevHandler);
        }
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "k") {
        if (nextHandler && !navBusy && !loading) {
          e.preventDefault();
          safeCall(nextHandler);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevHandler, nextHandler, navBusy, loading, safeCall]);

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
            <div className="text-lg sm:text-xl md:text-2xl font-bold truncate max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
              {mangaTitle || title}
            </div>

            {/* ชื่อตอน */}
            {chapterTitle && (
              <div className="text-base sm:text-lg text-gray-200 truncate max-w-xs sm:max-w-sm md:max-w-lg mx-auto mt-1">
                {chapterTitle}
              </div>
            )}

            {/* เลขตอน */}
            {chapterNumber != null && (
              <div className="text-sm sm:text-base text-gray-300 mt-0.5">
                {chapterNumber}
              </div>
            )}
          </div>
          {/* Right: existing controls */}
          <div className="flex items-center gap-3 text-gray-100 flex-none">
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
        <div className="flex-1">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${currentProgress || 0}%` }}
            />
          </div>
          {totalPages > 0 && (
            <div className="mt-1.5 text-xs sm:text-sm text-gray-300 text-center">
              Page {activePage + 1} of {totalPages}
            </div>
          )}
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth bg-black"
        onClick={() => setShowChrome((prev) => !prev)}
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

          {totalPages > 0 && (
            <div className="flex flex-col items-center">
              {effectivePages.map((src, index) => (
                <div
                  key={index}
                  className="w-full max-w-3xl mb-2 sm:mb-4 last:mb-0"
                >
                  <img
                    ref={(el) => {
                      const prev = imageRefs.current[index];
                      // Unobserve previous element if it existed
                      if (!el && prev && observerRef.current) {
                        try { observerRef.current.unobserve(prev); } catch (_) {}
                      }

                      if (el) {
                        imageRefs.current[index] = el;
                        // Observe immediately when the element mounts
                        if (observerRef.current) {
                          try { observerRef.current.observe(el); } catch (_) {}
                        }
                      } else {
                        delete imageRefs.current[index];
                      }
                    }}
                    data-page-index={index}
                    src={src}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto rounded-sm sm:rounded-md shadow-sm select-none"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <div
        className={`fixed inset-0 z-30 flex justify-end transition-[opacity] duration-200 ${isChapterPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isChapterPanelOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsChapterPanelOpen(false)}
        />
        <div
          className={`relative w-72 sm:w-80 h-full bg-black/95 border-l border-white/10 shadow-xl transform transition-transform duration-300 ease-out flex flex-col ${isChapterPanelOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-bold truncate">รายการตอน</div>
              <div className="text-xs sm:text-sm text-gray-300 mt-0.5">ตอนทั้งหมด ({chapters?.length ?? 0})</div>
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
            {chaptersLoading && (
              <div className="py-6 text-center text-gray-300">Loading chapters...</div>
            )}

            {!chaptersLoading && chaptersError && (
              <div className="py-4">
                <div className="text-red-400 text-sm mb-2">{chaptersError}</div>
                <button
                  type="button"
                  onClick={() => setChaptersFetchedFor(null)}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!chaptersLoading && !chaptersError && chapters && chapters.length > 0 && (
              <div className="space-y-2">
                {chapters.map((ch) => {
                  const isActive = ch.id === id;
                  const labelLeft = ch.chapter ? `Ch. ${ch.chapter}` : "Chapter";
                  const labelRight = ch.title || "Untitled";
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        const newPath = location.pathname.replace(id, ch.id);
                        navigate(newPath, { state: { mangaId: resolvedMangaId, mangaTitle: title } });
                        setIsChapterPanelOpen(false);
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border flex items-center justify-between gap-4 text-left transition-all duration-150 ${isActive
                        ? "bg-white/20 border-white/20 shadow-none"
                        : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20 hover:shadow-md"
                        }`}
                    >
                      <span className="truncate">
                        <span className="text-gray-100 font-semibold text-sm sm:text-base">{labelLeft}</span>
                        <span className="text-gray-300 ml-2 truncate text-xs sm:text-sm">{labelRight}</span>
                      </span>
                      {isActive && (
                        <span className="ml-2 text-xs sm:text-sm text-white bg-white/25 rounded-full px-2.5 py-0.5">Current</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!chaptersLoading && !chaptersError && (!chapters || chapters.length === 0) && (
              <div className="py-6 text-center text-gray-300">No chapters found.</div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`
    fixed inset-0 z-40 flex items-center justify-center 
    ${isCommentsOpen
            ? "transition-[opacity] duration-200 opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"}
  `}
      >
        {/* Backdrop */}
        <button
          type="button"
          className={`
      absolute inset-0 bg-black/60 backdrop-blur-sm 
      ${isCommentsOpen ? "transition-opacity duration-200 opacity-100" : "opacity-0"}
    `}
          onClick={() => setIsCommentsOpen(false)}
        />

        {/* Modal Container */}
        <div
          className={`
      relative w-full max-w-3xl mx-6 rounded-2xl bg-zinc-900 text-white 
      shadow-2xl border border-white/10 overflow-hidden transform 
      ${isCommentsOpen
              ? "transition-all duration-200 ease-out opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"}
    `}
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Comments</h2>
              <p className="text-sm sm:text-base text-gray-300 mt-1">
                {commentsCount} {commentsCount === 1 ? "person has" : "people have"} commented
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <span className="text-sm sm:text-base text-gray-200">Sort by</span>
              <select
                className="h-10 rounded-full bg-black/40 border border-white/20 text-sm sm:text-base px-4 text-gray-100 focus:outline-none focus:ring-1 focus:ring-white/40"
                defaultValue="newest"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="top">Top rated</option>
              </select>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* New Comment Input */}
          <div className="px-6 py-4 border-t border-white/10 flex gap-3 items-center">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 h-10 rounded-full bg-black/30 border border-white/20 px-4 text-gray-100 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
            <button
              type="button"
              className="h-10 px-4 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-white"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <footer
        className={`sticky bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-200 ${showChrome ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="w-full px-4 sm:px-6 pt-3 pb-4 sm:pb-5">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
                    e.preventDefault();
                    e.stopPropagation();
                    safeCall(prevHandler);
                  }}
                  onTouchEnd={(e) => {
                    suppressClickRef.current = true;
                    e.preventDefault();
                    e.stopPropagation();
                    safeCall(prevHandler);
                  }}
                  disabled={!prevHandler || navBusy || loading}
                  className="px-3.5 sm:px-4 py-2 rounded-full text-sm sm:text-base bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous chapter"
                  title="Previous chapter (← or J)"
                >
                  Prev
                </button>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={(e) => {
                    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
                    e.preventDefault();
                    e.stopPropagation();
                    safeCall(nextHandler);
                  }}
                  onTouchEnd={(e) => {
                    suppressClickRef.current = true;
                    e.preventDefault();
                    e.stopPropagation();
                    safeCall(nextHandler);
                  }}
                  disabled={!nextHandler || navBusy || loading}
                  className="px-3.5 sm:px-4 py-2 rounded-full text-sm sm:text-base bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next chapter"
                  title="Next chapter (→ or K)"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">


            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}