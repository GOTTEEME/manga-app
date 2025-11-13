import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCategory } from "../contexts/CategoryContext";
import { CATEGORY_LIST, getCategoryLabel } from "../utils/category";
import { getMangaByCategory } from "../api/mangadex";
import LoadingSpinner from "../components/LoadingSpinner";
import MangaGrid from "../components/MangaGrid";

export default function CategoryPage() {
  const { category: urlCategory } = useParams();
  const navigate = useNavigate();
  const { isThai } = useLanguage();
  const { category, setCategory } = useCategory();

  const normalized = (urlCategory || "all").toLowerCase();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 30;

  // Validate category from URL
  useEffect(() => {
    if (!CATEGORY_LIST.includes(normalized)) {
      navigate("/", { replace: true });
      return;
    }
    // Sync context
    if (category !== normalized) setCategory(normalized);
  }, [normalized]);

  // Fetch initial
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const data = await getMangaByCategory(normalized, { limit: LIMIT, offset: 0, order: { updatedAt: "desc" } });
        if (!cancelled) {
          setItems(data);
          setOffset(data.length);
          setHasMore(data.length === LIMIT);
        }
      } catch (e) {
        if (!cancelled) setError(isThai ? "โหลดข้อมูลหมวดหมู่ล้มเหลว" : "Failed to load category");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [normalized, isThai]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const data = await getMangaByCategory(normalized, { limit: LIMIT, offset, order: { updatedAt: "desc" } });
      setItems(prev => [...prev, ...data]);
      setOffset(prev => prev + data.length);
      setHasMore(data.length === LIMIT);
    } catch (e) {
      setError(isThai ? "โหลดข้อมูลเพิ่มเติมล้มเหลว" : "Failed to load more");
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(() => getCategoryLabel(normalized, isThai), [normalized, isThai]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {loading && items.length === 0 ? (
          <div className="w-full flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <MangaGrid items={items} />
        )}

        <div className="mt-8 flex items-center justify-center">
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                loading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {loading ? (isThai ? "กำลังโหลด..." : "Loading...") : (isThai ? "โหลดเพิ่มเติม" : "Load More")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
