import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getChapterPages, getChaptersByMangaId, getMangaById } from "../api/mangadex";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ChapterReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [manga, setManga] = useState(null);
  const [chaptersList, setChaptersList] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [viewMode, setViewMode] = useState("single"); // single, double, longstrip
  const [showChapterList, setShowChapterList] = useState(false);
  const [imageQuality, setImageQuality] = useState("dataSaver"); // dataSaver or full
  const readerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Fetch chapter pages and related data
  useEffect(() => {
    async function fetchChapterData() {
      try {
        setLoading(true);
        setError(null);
        
        // Get chapter pages
        const pagesData = await getChapterPages(id);
        setPages(pagesData.quality[imageQuality]);
        
        // Get manga details (we'll need this for navigation)
        // This is a simplified approach - in a real app you might pass manga info via state
        // or have a more efficient way to get this data
        setChapter({
          id,
          pages: pagesData.quality[imageQuality].length,
          baseUrl: pagesData.baseUrl,
          hash: pagesData.hash,
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chapter:", err);
        setError(err.message || "Failed to load chapter");
        setLoading(false);
      }
    }

    if (id) {
      fetchChapterData();
    }
  }, [id, imageQuality]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (showControls) {
      resetControlsTimeout();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode === "longstrip") return;
      
      if (e.key === "ArrowRight" && currentPage < pages.length - 1) {
        setCurrentPage(currentPage + 1);
        setShowControls(true);
      } else if (e.key === "ArrowLeft" && currentPage > 0) {
        setCurrentPage(currentPage - 1);
        setShowControls(true);
      } else if (e.key === " ") {
        e.preventDefault();
        setShowControls(!showControls);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages, showControls, viewMode]);

  const goToPage = (page) => {
    if (page >= 0 && page < pages.length) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };

  const handleReaderClick = () => {
    setShowControls(!showControls);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const toggleImageQuality = () => {
    const newQuality = imageQuality === "dataSaver" ? "full" : "dataSaver";
    setImageQuality(newQuality);
    
    // Reload pages with new quality
    if (chapter) {
      getChapterPages(id).then(pagesData => {
        setPages(pagesData.quality[newQuality]);
      }).catch(err => {
        console.error("Error reloading pages with new quality:", err);
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading chapter..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-red-500 text-6xl mb-4">
            <svg
              className="w-24 h-24 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Chapter</h1>
          <p className="mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
            <Link to="/" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-black">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter || pages.length === 0) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <p className="mb-6">The chapter you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen relative overflow-hidden" ref={readerRef}>
      {/* Header Controls */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-white hover:text-primary transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </Link>
            <div className="text-white">
              <h1 className="font-bold">Chapter Reader</h1>
              <p className="text-sm text-gray-300">
                Page {currentPage + 1} of {pages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("single")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === "single"
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setViewMode("double")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === "double"
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                }`}
              >
                Double
              </button>
              <button
                onClick={() => setViewMode("longstrip")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === "longstrip"
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                }`}
              >
                Long Strip
              </button>
            </div>

            {/* Image Quality Toggle */}
            <button
              onClick={toggleImageQuality}
              className="text-white hover:text-primary transition-colors p-2"
              title={`Current: ${imageQuality === "dataSaver" ? "Low" : "High"} Quality`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reader Area */}
      <div
        className="flex items-center justify-center min-h-screen"
        onClick={handleReaderClick}
        onMouseMove={handleMouseMove}
      >
        {viewMode === "single" && (
          <div className="max-w-4xl w-full">
            {pages[currentPage] && (
              <img
                src={pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="w-full h-auto mx-auto"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x1200?text=Page+${currentPage + 1}+Error`;
                }}
              />
            )}
          </div>
        )}

        {viewMode === "double" && (
          <div className="max-w-6xl w-full">
            <div className="flex justify-center">
              {currentPage > 0 && pages[currentPage - 1] && (
                <img
                  src={pages[currentPage - 1]}
                  alt={`Page ${currentPage}`}
                  className="w-1/2 h-auto pr-1"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x1200?text=Page+${currentPage}+Error`;
                  }}
                />
              )}
              {pages[currentPage] && (
                <img
                  src={pages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="w-1/2 h-auto pl-1"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x1200?text=Page+${currentPage + 1}+Error`;
                  }}
                />
              )}
            </div>
          </div>
        )}

        {viewMode === "longstrip" && (
          <div className="max-w-4xl w-full">
            {pages.map((page, index) => (
              <img
                key={index}
                src={page}
                alt={`Page ${index + 1}`}
                className="w-full h-auto mb-0"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x1200?text=Page+${index + 1}+Error`;
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Page Navigation */}
      {viewMode !== "longstrip" && (
        <>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            } ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-black/70"}`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            } ${
              currentPage === pages.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-black/70"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </>
      )}

      {/* Footer Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Page Selector */}
            <div className="flex items-center space-x-2 text-white">
              <span>Page</span>
              <input
                type="number"
                min="1"
                max={pages.length}
                value={currentPage + 1}
                onChange={(e) => {
                  const page = parseInt(e.target.value) - 1;
                  if (page >= 0 && page < pages.length) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 px-2 py-1 text-center bg-white/20 border border-white/30 rounded text-white"
              />
              <span>of {pages.length}</span>
            </div>

            <div className="text-white text-sm">
              Quality: {imageQuality === "dataSaver" ? "Low" : "High"}
            </div>
          </div>

          {/* Page Progress Bar */}
          <div className="flex-1 mx-8">
            <div className="bg-white/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-200"
                style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="text-white hover:text-primary transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}