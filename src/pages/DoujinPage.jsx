import { useEffect, useState } from "react";
import { getAdultManga } from "../api/mangadex";
import LoadingSpinner from "../components/LoadingSpinner";
import MangaGrid from "../components/MangaGrid";

export default function DoujinPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [genreFilter, setGenreFilter] = useState("all");
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
        const data = await getAdultManga({
          limit: LIMIT,
          offset: (currentPage - 1) * LIMIT,
          order: { updatedAt: "desc" },
        });
        if (!cancelled) {
          setItems(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError("โหลดโดจิน 18+ ล้มเหลว");
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
  }, [currentPage]);

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

  useEffect(() => {
    // When changing genre filter, always go back to the first page
    setCurrentPage(1);
  }, [genreFilter]);

  const filteredItems = items.filter((manga) => {
    if (genreFilter === "all") return true;

    const tags = (manga.tags || []).map((t) => (t || "").toLowerCase());

    const isMaleMale =
      tags.includes("yaoi") ||
      tags.includes("boys' love") ||
      tags.includes("boys love");

    const isFemaleFemale =
      tags.includes("yuri") ||
      tags.includes("girls' love") ||
      tags.includes("girls love");

    const isStraight = tags.includes("heterosexual");

    switch (genreFilter) {
      case "male-male":
        return isMaleMale;
      case "female-female":
        return isFemaleFemale;
      case "straight":
        return isStraight;
      case "other":
        return !isMaleMale && !isFemaleFemale && !isStraight;
      default:
        return true;
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            โดจิน / การ์ตูนผู้ใหญ่ 18+
          </h1>
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            เนื้อหาหน้านี้มีเฉพาะผู้ชมที่มีอายุ 18 ปีขึ้นไปเท่านั้น กรุณาใช้งานด้วยความรับผิดชอบ
          </div>
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-xs sm:text-sm">
            <span className="text-gray-600 mr-2">
              กรองตามแนว:
            </span>
            {["all", "male-male", "female-female", "straight", "other"].map((key) => {
              const label = (() => {
                switch (key) {
                  case "male-male":
                    return "ชาย x ชาย";
                  case "female-female":
                    return "หญิง x หญิง";
                  case "straight":
                    return "ชาย x หญิง";
                  case "other":
                    return "อื่น ๆ";
                  case "all":
                  default:
                    return "ทั้งหมด";
                }
              })();

              const isActive = genreFilter === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setGenreFilter(key)}
                  className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors duration-200 ${
                    isActive
                      ? "bg-primary text-white border-primary shadow"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
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
          <MangaGrid items={filteredItems} />
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
            ก่อนหน้า
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
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
