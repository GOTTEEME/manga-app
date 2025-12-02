import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getChapterPages, getChaptersByMangaId } from "../api/mangadex";
import { useQuery } from "@tanstack/react-query";

export default function ChapterReader({
  mangaTitle,
  chapterNumber,
  chapterTitle = "",
  pages,
  onPrevChapter,
  onNextChapter,
}) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateMangaTitle = location.state?.mangaTitle;
  const stateMangaId = location.state?.mangaId;
  const [resolvedMangaId, setResolvedMangaId] = useState(stateMangaId || null);
  const [resolvedChapterNumber, setResolvedChapterNumber] = useState(null);

  const [showChrome, setShowChrome] = useState(true);

  const [internalPages, setInternalPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChapterPanelOpen, setIsChapterPanelOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chaptersError, setChaptersError] = useState(null);
  const [chaptersFetchedFor, setChaptersFetchedFor] = useState(null);
  const [navBusy, setNavBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState(0);

  const scrollContainerRef = useRef(null);

  const suppressClickRef = useRef(false);
  const mangaIdForKey = resolvedMangaId || stateMangaId || "unknown";

  const {
    data: queryPagesData,
    isLoading: pagesIsLoading,
    isFetching: pagesIsFetching,
    isError: pagesIsError,
    error: pagesErrorObj,
  } = useQuery({
    queryKey: ["chapterPages", mangaIdForKey, id],
    queryFn: ({ signal }) => getChapterPages(id, { signal }),
    enabled: !!id,
    keepPreviousData: true,
    select: (data) => data?.quality?.full || data?.pages || data?.pagesDataSaver || [],
  });

  const {
    data: chaptersData,
    isLoading: chaptersIsLoadingRQ,
    isFetching: chaptersIsFetchingRQ,
    isError: chaptersIsErrorRQ,
    error: chaptersErrorObj,
  } = useQuery({
    queryKey: ["chapterList", resolvedMangaId || null],
    queryFn: ({ signal }) =>
      getChaptersByMangaId(resolvedMangaId, { fetchAll: true, order: { chapter: "asc" }, translatedLanguage: undefined, signal }),
    enabled: !!resolvedMangaId,
    keepPreviousData: true,
    select: (list) =>
      (list || [])
        .slice()
        .sort((a, b) => {
          const na = parseFloat(a.chapter);
          const nb = parseFloat(b.chapter);
          const aNum = isNaN(na) ? Infinity : na;
          const bNum = isNaN(nb) ? Infinity : nb;
          if (aNum === bNum) return String(a.chapter).localeCompare(String(b.chapter));
          return aNum - bNum;
        }),
  });

  const effectivePages = Array.isArray(pages) && pages.length > 0 ? pages : (queryPagesData || internalPages);
  const queryPagesError = pagesIsError ? (pagesErrorObj?.message || "Failed to load chapter pages.") : null;
  const totalPages = Array.isArray(effectivePages) ? effectivePages.length : 0;

  const title = mangaTitle || stateMangaTitle || "Chapter Reader";

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
    setError(null);
    return () => { clearTimeout(t); };
  }, [id]);

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
        const chNum = data?.data?.attributes?.chapter;
        if (!cancelled && (chNum != null && chNum !== "")) {
          setResolvedChapterNumber(chNum);
        }
      } catch (_) {
        // ignore resolution errors, user can still read pages
      }
    }
    resolveManga();
    return () => { cancelled = true; };
  }, [id, resolvedMangaId]);

  useEffect(() => {
    if (!resolvedMangaId) return;
    if (chaptersData && Array.isArray(chaptersData)) {
      setChapters(chaptersData);
      setChaptersFetchedFor(resolvedMangaId);
    }
    setChaptersLoading(Boolean(chaptersIsLoadingRQ || chaptersIsFetchingRQ));
    setChaptersError(chaptersIsErrorRQ ? (chaptersErrorObj?.message || "Failed to load chapters.") : null);
  }, [resolvedMangaId, chaptersData, chaptersIsLoadingRQ, chaptersIsFetchingRQ, chaptersIsErrorRQ, chaptersErrorObj]);

  const currentIndex = useMemo(() => {
    if (!chapters || chapters.length === 0) return -1;
    return chapters.findIndex((c) => c.id === id);
  }, [chapters, id]);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < (chapters?.length ?? 0) - 1;

  const displayChapterNumber = useMemo(() => {
    if (chapterNumber != null) return chapterNumber;
    if (resolvedChapterNumber != null && resolvedChapterNumber !== "") return resolvedChapterNumber;
    const current = currentIndex >= 0 ? chapters[currentIndex] : null;
    if (current?.chapter != null && current?.chapter !== "") return current.chapter;
    if (currentIndex >= 0) return currentIndex + 1;
    return null;
  }, [chapterNumber, resolvedChapterNumber, currentIndex, chapters]);

  const displayChapterNumberOrDefault = useMemo(() => {
    return displayChapterNumber != null && displayChapterNumber !== ""
      ? displayChapterNumber
      : 1;
  }, [displayChapterNumber]);

  const displayChapterTitle = useMemo(() => {
    if (chapterTitle) return chapterTitle;
    const current = currentIndex >= 0 ? chapters[currentIndex] : null;
    return current?.title || "";
  }, [chapterTitle, currentIndex, chapters]);

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

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

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
        if (prevHandler && !navBusy && !pagesIsFetching) {
          e.preventDefault();
          safeCall(prevHandler);
        }
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "k") {
        if (nextHandler && !navBusy && !pagesIsFetching) {
          e.preventDefault();
          safeCall(nextHandler);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevHandler, nextHandler, navBusy, pagesIsFetching, safeCall]);

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
              onClick={() => navigate('/')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Home"
              title="Home"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 10.5L12 3L21 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.5 9V20H18.5V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => {
                const mid = resolvedMangaId || stateMangaId;
                if (mid) navigate(`/manga/${mid}`);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!(resolvedMangaId || stateMangaId)}
              aria-label="Detail"
              title="Detail"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.5 6.5C4.5 5.395 5.395 4.5 6.5 4.5H12C13.105 4.5 14 5.395 14 6.5V19.5C14 18.395 13.105 17.5 12 17.5H6.5C5.395 17.5 4.5 18.395 4.5 19.5V6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 6.5C14 5.395 14.895 4.5 16 4.5H19C20.105 4.5 21 5.395 21 6.5V19.5C21 18.395 20.105 17.5 19 17.5H16C14.895 17.5 14 18.395 14 19.5V6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 8.5L18.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Center: manga title + chapter name/number, stacked & centered */}
          <div className="flex-1 min-w-0 text-center">
            {/* ชื่อเรื่อง + หมายเลขตอน แยกบรรทัด */}
            <div className="flex flex-col items-center mx-auto max-w-xs sm:max-w-sm md:max-w-lg leading-tight">

              {/* ชื่อเรื่อง */}
              <span className="text-lg sm:text-xl md:text-2xl font-bold truncate w-full">
                {mangaTitle || title}
              </span>

              {/* หมายเลขตอน */}
              <span className="text-xs text-gray-300 font-normal truncate max-w-full">
                {displayChapterNumberOrDefault}
                {displayChapterTitle ? ` • ${displayChapterTitle}` : null}
              </span>
            </div>
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
            </div>
          </div>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth bg-black"
        onClick={() => setShowChrome((prev) => !prev)}
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {pagesIsLoading && totalPages === 0 && (
            <div className="flex h-[60vh] items-center justify-center text-sm text-gray-300">
              Loading pages...
            </div>
          )}

          {!pagesIsLoading && queryPagesError && totalPages === 0 && (
            <div className="flex h-[60vh] items-center justify-center text-center text-sm text-red-400 px-4">
              <div>
                <p className="mb-2">{queryPagesError}</p>
                <p className="text-xs text-gray-400">Try going back and reopening the chapter.</p>
              </div>
            </div>
          )}

          {!pagesIsLoading && !queryPagesError && !totalPages && (
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

      <footer
        className={`sticky bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-200 ${showChrome ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
                  disabled={!prevHandler || navBusy || pagesIsFetching}
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
                  disabled={!nextHandler || navBusy || pagesIsFetching}
                  className="px-3.5 sm:px-4 py-2 rounded-full text-sm sm:text-base bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next chapter"
                  title="Next chapter (→ or K)"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}