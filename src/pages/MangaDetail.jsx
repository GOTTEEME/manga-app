import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMangaById, getChaptersByMangaId, getMangaList } from "../api/mangadex";
import LoadingSpinner from "../components/LoadingSpinner";
import MangaCard from "../components/MangaCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useFavorites, isFavorite } from "../utils/favorites";

export default function MangaDetail() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("chapters");
  const [relatedManga, setRelatedManga] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const { getTitle, getDescription } = useLanguage();
  const [descExpanded, setDescExpanded] = useState(false);
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  const inFavorites = isFavorite(favorites, id);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    setActiveTab("chapters");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [id]);

  const handleStartReading = () => {
    if (chaptersLoading || !chapters || chapters.length === 0) return;

    const preferred = ["th", "en"];
    let pool = [];
    for (const lang of preferred) {
      const subset = chapters.filter((c) => (c.translatedLanguage || "").toLowerCase() === lang);
      if (subset.length) {
        pool = subset;
        break;
      }
    }
    if (pool.length === 0) pool = chapters.slice();

    const parseChapterNum = (c) => {
      const n = parseFloat(c.chapter);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };

    pool.sort((a, b) => {
      const an = parseChapterNum(a);
      const bn = parseChapterNum(b);
      if (an !== bn) return an - bn;
      const ad = a.publishAt ? new Date(a.publishAt).getTime() : Infinity;
      const bd = b.publishAt ? new Date(b.publishAt).getTime() : Infinity;
      if (ad !== bd) return ad - bd;
      return (a.title || "").localeCompare(b.title || "");
    });

    const first = pool[0];
    if (first && first.id) {
      navigate(`/chapter/${first.id}`, {
        state: { mangaTitle: getTitle(manga), mangaId: id },
      });
    }
  };

  // Fetch manga details
  useEffect(() => {
    async function fetchMangaDetails() {
      try {
        setLoading(true);
        setError(null);
        const mangaData = await getMangaById(id);
        setManga(mangaData);
      } catch (err) {
        console.error("Error fetching manga details:", err);
        setError(err.message || "Failed to load manga details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchMangaDetails();
    }
  }, [id]);

  // Fetch chapters when manga data is loaded
  useEffect(() => {
    async function fetchChapters() {
      if (!manga) return;

      try {
        setChaptersLoading(true);
        // For adult/18+ titles, fetch chapters in all languages.
        // For others, prefer Thai/English.
        const isAdult = ["erotica", "pornographic"].includes(
          (manga.contentRating || "").toLowerCase()
        );

        const languages = isAdult ? [] : ["th", "en"];
        const chaptersData = await getChaptersByMangaId(id, {
          limit: 100,
          translatedLanguage: languages,
          fetchAll: true // Fetch all chapters
        });
        setChapters(chaptersData);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        // Don't set error for chapters, just leave empty
        console.warn("Could not load chapters");
      } finally {
        setChaptersLoading(false);
      }
    }

    if (manga) {
      fetchChapters();
    }
  }, [manga, id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "hiatus":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContentRatingColor = (rating) => {
    switch (rating?.toLowerCase()) {
      case "safe":
        return "bg-green-100 text-green-800";
      case "suggestive":
        return "bg-yellow-100 text-yellow-800";
      case "erotica":
        return "bg-red-100 text-red-800";
      case "pornographic":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Fetch related manga based on shared tags
  useEffect(() => {
    async function fetchRelated() {
      if (!manga || !manga.raw) return;

      try {
        setRelatedLoading(true);
        setRelatedError(null);

        const rawTags = manga.raw?.attributes?.tags || [];
        const includedTags = rawTags.slice(0, 3).map((t) => t.id);

        const options = {
          limit: 7, // fetch a few extra in case current manga appears in results
          offset: 0,
          order: { updatedAt: "desc" },
          includes: ["cover_art", "author", "artist"],
          contentRating: ["safe", "suggestive"],
        };

        if (includedTags.length) {
          options.includedTags = includedTags;
        }

        const list = await getMangaList(options);
        const filtered = list.filter((item) => item.id !== manga.id).slice(0, 6);
        setRelatedManga(filtered);
      } catch (e) {
        console.error("Error fetching related manga", e);
        setRelatedError(e.message || "Failed to load related comics");
      } finally {
        setRelatedLoading(false);
      }
    }

    fetchRelated();
  }, [manga]);

  // Chapter language filter (per manga detail page).
  // Empty string means "all languages".
  const [chapterLanguage, setChapterLanguage] = useState("");

  const filteredChapters = chapters.filter((chapter) => {
    const lang = (chapter.translatedLanguage || "").toLowerCase();
    return chapterLanguage ? lang === chapterLanguage : true;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="w-64 h-96 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Manga</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Manga not found</h1>
          <p className="text-gray-600 mb-6">The manga you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0 mb-4 md:mb-0">
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-64 h-96 object-cover rounded-lg shadow-xl"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x450?text=No+Cover";
                }}
              />
            </div>

            {/* Manga Info */}
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(manga.status)}`}>
                  {manga.status}
                </span>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getContentRatingColor(manga.contentRating)}`}>
                  {manga.contentRating}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center md:text-left leading-snug break-words">
                {getTitle(manga)}
                {manga.thaiTitle && getTitle(manga) !== manga.title && (
                  <div className="text-xl text-white/80 mt-2">
                    {manga.title}
                  </div>
                )}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  <span>Author: {manga.author}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span>Year: {manga.year}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>Updated: {formatDate(manga.updatedAt)}</span>
                </div>
                {manga.lastChapter && manga.lastChapter !== "Ongoing" && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      ></path>
                    </svg>
                    <span>Latest Chapter: {manga.lastChapter}</span>
                  </div>
                )}
              </div>

              <div className="text-white/90 mb-6 leading-relaxed">
                <span>
                  {descExpanded
                    ? (getDescription(manga) || "")
                    : ((getDescription(manga) || "").length > 200
                      ? (getDescription(manga).slice(0, 200).trim() + "...")
                      : (getDescription(manga) || ""))}
                </span>
                {(getDescription(manga) || "").length > 200 && (
                  <button
                    className="ml-2 underline text-white hover:text-white/80"
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    {descExpanded ? "แสดงน้อยลง" : "อ่านเพิ่มเติม"}
                  </button>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {manga.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Demographic */}
              {manga.publicationDemographic && (
                <div className="mb-6">
                  <span className="text-sm text-white/70">Demographic: </span>
                  <span className="px-2 py-1 bg-white/20 rounded text-sm">
                    {manga.publicationDemographic}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleStartReading}
                  disabled={chaptersLoading || chapters.length === 0}
                  className="btn bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  เริ่มอ่าน
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(id)}
                  className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  {inFavorites ? "ลบออกจากคลัง" : "เพิ่มในคลัง"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs (Chapters / Related) */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("chapters")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "chapters"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {`ตอนทั้งหมด (${chapters.length})`}
            </button>
            <button
              onClick={() => setActiveTab("related")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "related"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              การ์ตูนที่เกี่ยวข้อง
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "chapters" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-gray-100">
                ตอนทั้งหมด
                <span className="ml-2 text-lg text-gray-500">({filteredChapters.length})</span>
              </h2>
              <div className="flex items-center space-x-4">
                {chapters.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {(() => {
                      const label = !chapterLanguage
                        ? "ทุกภาษา"
                        : chapterLanguage.toUpperCase();
                      return `แสดง ${filteredChapters.length} ตอน (${label})`;
                    })()}
                  </span>
                )}
                <div className="inline-flex items-center rounded-full bg-gray-100 p-1 shadow-sm border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setChapterLanguage("en")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${chapterLanguage === "en"
                        ? "bg-primary text-white shadow"
                        : "bg-transparent text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-700/70"
                      }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterLanguage("th")}
                    className={`ml-1 px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${chapterLanguage === "th"
                        ? "bg-primary text-white shadow"
                        : "bg-transparent text-gray-600 hover:bg-white/70"
                      }`}
                  >
                    TH
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterLanguage("")}
                    className={`ml-1 px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
                      !chapterLanguage
                        ? "bg-primary text-white shadow"
                        : "bg-transparent text-gray-600 hover:bg-white/70"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                </div>
              </div>
            </div>

            {chaptersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" text="กำลังโหลดตอน..." />
              </div>
            ) : filteredChapters.length > 0 ? (
              <div
                className={`bg-white rounded-lg shadow-sm overflow-hidden dark:bg-gray-900 dark:text-gray-100 ${chapters.length > 5 ? "max-h-[520px] overflow-y-auto" : ""
                  }`}
              >
                <div className="divide-y divide-gray-200 border border-gray-200 dark:border-gray-800">
                  {filteredChapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      to={`/chapter/${chapter.id}`}
                      state={{ mangaTitle: getTitle(manga), mangaId: id }}
                      className="block hover:bg-gray-50 transition-colors dark:hover:bg-gray-800"
                    >
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {chapter.title}
                            {chapter.translatedLanguage && (
                              <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-200">
                                {chapter.translatedLanguage.toUpperCase()}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">
                            {chapter.volume && `เล่ม ${chapter.volume}, `}ตอนที่ {chapter.chapter}
                            {chapter.pages && ` • ${chapter.pages} หน้า`}
                            {chapter.translatedLanguage && ` • ${chapter.translatedLanguage.toUpperCase()}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 dark:text-gray-400">
                            วางจำหน่ายเมื่อ {formatDate(chapter.publishAt)}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center dark:bg-gray-900 dark:text-gray-100">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
                <p className="text-gray-500">ไม่มีตอนที่ให้อ่าน</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "related" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">การ์ตูนที่เกี่ยวข้อง</h2>

            {relatedLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center dark:bg-gray-900 dark:text-gray-100">
                <LoadingSpinner size="md" text="กำลังโหลดการ์ตูนที่เกี่ยวข้อง..." />
              </div>
            ) : relatedError ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-500 text-sm dark:bg-gray-900 dark:text-red-400">
                {relatedError}
              </div>
            ) : relatedManga.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-900">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {relatedManga.map((item) => (
                    <MangaCard key={item.id} manga={item} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center dark:bg-gray-900 dark:text-gray-100">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                <p className="text-gray-500 dark:text-gray-300">
                  ยังไม่พบการ์ตูนที่เกี่ยวข้องสำหรับเรื่องนี้
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
